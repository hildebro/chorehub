CREATE TYPE "public"."admin" AS ENUM('none', 'household', 'server');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "admin" "admin" DEFAULT 'none' NOT NULL;--> statement-breakpoint
UPDATE "user" SET admin = 'household' WHERE household_admin = true;--> statement-breakpoint
UPDATE "user" SET admin = 'server' WHERE server_admin = true;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "household_admin";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "server_admin";
