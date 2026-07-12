ALTER TABLE "task" DROP CONSTRAINT "task_state_check";--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "end_date" date;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_state_check" CHECK (
      ("task"."type" = 'single' AND "task"."due_weekday" IS NULL AND "task"."due_interval" IS NULL AND "task"."assignment" IS NULL AND "task"."end_date" IS NULL)
      OR
      ("task"."type" = 'repeating' AND "task"."due_weekday" IS NOT NULL AND "task"."due_interval" IS NOT NULL AND "task"."due_date" IS NOT NULL AND "task"."assignment" IS NOT NULL)
    );