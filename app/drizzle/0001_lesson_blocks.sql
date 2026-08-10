CREATE TABLE `lesson_block` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lesson_id` integer NOT NULL,
	`ordinal` integer NOT NULL,
	`kind` text NOT NULL,
	`content` text NOT NULL,
	`concept_id` integer,
	FOREIGN KEY (`lesson_id`) REFERENCES `lesson`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `lesson_block_lesson_idx` ON `lesson_block` (`lesson_id`,`ordinal`);--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`lesson_id` integer PRIMARY KEY NOT NULL,
	`last_block_ordinal` integer DEFAULT 0 NOT NULL,
	`started_at` integer DEFAULT (unixepoch()) NOT NULL,
	`completed_at` integer,
	`ms_on_task` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`lesson_id`) REFERENCES `lesson`(`id`) ON UPDATE no action ON DELETE no action
);
