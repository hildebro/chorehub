CREATE TYPE "public"."systemStoreKey" AS ENUM('remote_version');--> statement-breakpoint
CREATE TABLE "system_store" (
	"key" "systemStoreKey" PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
