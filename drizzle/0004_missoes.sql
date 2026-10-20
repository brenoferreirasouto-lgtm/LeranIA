ALTER TYPE "public"."xp_source" ADD VALUE 'missao';--> statement-breakpoint
CREATE TABLE "mission_answers" (
	"attempt_id" uuid NOT NULL,
	"step_id" text NOT NULL,
	"option_ids" text[] NOT NULL,
	"is_correct" boolean NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mission_answers_attempt_id_step_id_pk" PRIMARY KEY("attempt_id","step_id")
);
--> statement-breakpoint
CREATE TABLE "mission_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"mission_id" text NOT NULL,
	"total" integer NOT NULL,
	"correct" integer,
	"passed" boolean,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "mission_answers" ADD CONSTRAINT "mission_answers_attempt_id_mission_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."mission_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_attempts" ADD CONSTRAINT "mission_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mission_attempts_user_mission_idx" ON "mission_attempts" USING btree ("user_id","mission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mission_attempts_one_open_idx" ON "mission_attempts" USING btree ("user_id","mission_id") WHERE "mission_attempts"."finished_at" is null;