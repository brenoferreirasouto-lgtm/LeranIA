CREATE TYPE "public"."xp_source" AS ENUM('nivelamento', 'aula', 'pratica', 'modulo', 'avaliacao', 'aprovacao');--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"user_id" text NOT NULL,
	"achievement_id" text NOT NULL,
	"earned_at" timestamp with time zone NOT NULL,
	CONSTRAINT "user_achievements_user_id_achievement_id_pk" PRIMARY KEY("user_id","achievement_id")
);
--> statement-breakpoint
CREATE TABLE "xp_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"source" "xp_source" NOT NULL,
	"source_id" text NOT NULL,
	"attempt_id" uuid,
	"points" integer NOT NULL,
	"earned_at" timestamp with time zone NOT NULL,
	CONSTRAINT "xp_events_points_positive" CHECK ("xp_events"."points" > 0)
);
--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "xp_events_user_source_idx" ON "xp_events" USING btree ("user_id","source","source_id");--> statement-breakpoint
CREATE INDEX "xp_events_user_earned_idx" ON "xp_events" USING btree ("user_id","earned_at");