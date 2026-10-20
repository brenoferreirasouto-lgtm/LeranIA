CREATE TYPE "public"."learning_level" AS ENUM('iniciante', 'intermediario', 'avancado');--> statement-breakpoint
CREATE TYPE "public"."learning_step" AS ENUM('aula', 'pratica');--> statement-breakpoint
CREATE TABLE "learner_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"level" "learning_level" NOT NULL,
	"placement_attempt_id" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "module_progress" (
	"user_id" text NOT NULL,
	"module_slug" text NOT NULL,
	"lesson_completed_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"best_score_percent" integer,
	"last_step" "learning_step",
	"last_activity_at" timestamp with time zone,
	CONSTRAINT "module_progress_user_id_module_slug_pk" PRIMARY KEY("user_id","module_slug")
);
--> statement-breakpoint
CREATE TABLE "placement_answers" (
	"attempt_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"option_id" text NOT NULL,
	"is_correct" boolean NOT NULL,
	CONSTRAINT "placement_answers_attempt_id_question_id_pk" PRIMARY KEY("attempt_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "placement_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"correct" integer NOT NULL,
	"total" integer NOT NULL,
	"score_percent" integer NOT NULL,
	"level" "learning_level" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice_answers" (
	"attempt_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"option_id" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "practice_answers_attempt_id_question_id_pk" PRIMARY KEY("attempt_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "practice_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"module_slug" text NOT NULL,
	"total" integer NOT NULL,
	"correct" integer,
	"score_percent" integer,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "learner_profiles" ADD CONSTRAINT "learner_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_profiles" ADD CONSTRAINT "learner_profiles_placement_attempt_id_placement_attempts_id_fk" FOREIGN KEY ("placement_attempt_id") REFERENCES "public"."placement_attempts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_progress" ADD CONSTRAINT "module_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement_answers" ADD CONSTRAINT "placement_answers_attempt_id_placement_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."placement_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement_attempts" ADD CONSTRAINT "placement_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_answers" ADD CONSTRAINT "practice_answers_attempt_id_practice_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."practice_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "placement_attempts_user_idx" ON "placement_attempts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "practice_attempts_user_module_idx" ON "practice_attempts" USING btree ("user_id","module_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "practice_attempts_one_open_idx" ON "practice_attempts" USING btree ("user_id","module_slug") WHERE "practice_attempts"."finished_at" is null;