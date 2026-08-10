CREATE TABLE `card` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`concept_id` integer NOT NULL,
	`type` text NOT NULL,
	`prompt` text NOT NULL,
	`answer` text NOT NULL,
	`extra` text,
	`direction` text DEFAULT 'recognition' NOT NULL,
	FOREIGN KEY (`concept_id`) REFERENCES `concept`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `card_concept_idx` ON `card` (`concept_id`);--> statement-breakpoint
CREATE TABLE `card_state` (
	`card_id` integer PRIMARY KEY NOT NULL,
	`due` integer NOT NULL,
	`stability` real DEFAULT 0 NOT NULL,
	`difficulty` real DEFAULT 0 NOT NULL,
	`elapsed_days` integer DEFAULT 0 NOT NULL,
	`scheduled_days` integer DEFAULT 0 NOT NULL,
	`reps` integer DEFAULT 0 NOT NULL,
	`lapses` integer DEFAULT 0 NOT NULL,
	`state` integer DEFAULT 0 NOT NULL,
	`last_review` integer,
	`suspended` integer DEFAULT false NOT NULL,
	`leech` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`card_id`) REFERENCES `card`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `card_state_due_idx` ON `card_state` (`due`,`suspended`);--> statement-breakpoint
CREATE TABLE `concept` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` integer NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`kind` text NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `concept_slug_unique` ON `concept` (`slug`);--> statement-breakpoint
CREATE TABLE `concept_interference` (
	`concept_id` integer NOT NULL,
	`collides_with_id` integer NOT NULL,
	`reason` text,
	PRIMARY KEY(`concept_id`, `collides_with_id`),
	FOREIGN KEY (`concept_id`) REFERENCES `concept`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`collides_with_id`) REFERENCES `concept`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `concept_prereq` (
	`concept_id` integer NOT NULL,
	`requires_id` integer NOT NULL,
	PRIMARY KEY(`concept_id`, `requires_id`),
	FOREIGN KEY (`concept_id`) REFERENCES `concept`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`requires_id`) REFERENCES `concept`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `course` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`language_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	FOREIGN KEY (`language_id`) REFERENCES `language`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `language` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`native_name` text NOT NULL,
	`extension` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `language_code_unique` ON `language` (`code`);--> statement-breakpoint
CREATE TABLE `lesson` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`unit_id` integer NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`ordinal` integer NOT NULL,
	`estimated_minutes` integer DEFAULT 5 NOT NULL,
	FOREIGN KEY (`unit_id`) REFERENCES `unit`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lesson_slug_unique` ON `lesson` (`slug`);--> statement-breakpoint
CREATE TABLE `lesson_concept` (
	`lesson_id` integer NOT NULL,
	`concept_id` integer NOT NULL,
	`role` text DEFAULT 'introduces' NOT NULL,
	PRIMARY KEY(`lesson_id`, `concept_id`),
	FOREIGN KEY (`lesson_id`) REFERENCES `lesson`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`concept_id`) REFERENCES `concept`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `level` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` integer NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`ordinal` integer NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `level_course_code` ON `level` (`course_id`,`code`);--> statement-breakpoint
CREATE TABLE `note` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scope` text NOT NULL,
	`lesson_id` integer,
	`session_id` integer,
	`card_id` integer,
	`body` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`lesson_id`) REFERENCES `lesson`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`session_id`) REFERENCES `session`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`card_id`) REFERENCES `card`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `note_lesson_idx` ON `note` (`lesson_id`);--> statement-breakpoint
CREATE INDEX `note_scope_idx` ON `note` (`scope`);--> statement-breakpoint
CREATE TABLE `review` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`card_id` integer NOT NULL,
	`session_id` integer,
	`reviewed_at` integer DEFAULT (unixepoch()) NOT NULL,
	`rating` integer NOT NULL,
	`state_before` integer NOT NULL,
	`elapsed_ms` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`card_id`) REFERENCES `card`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`session_id`) REFERENCES `session`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `review_card_idx` ON `review` (`card_id`);--> statement-breakpoint
CREATE INDEX `review_at_idx` ON `review` (`reviewed_at`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`started_at` integer DEFAULT (unixepoch()) NOT NULL,
	`ended_at` integer,
	`kind` text NOT NULL,
	`lesson_id` integer,
	`pomodoro_index` integer,
	`fatigue_flagged` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`lesson_id`) REFERENCES `lesson`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `study_day` (
	`day` text PRIMARY KEY NOT NULL,
	`reviews` integer DEFAULT 0 NOT NULL,
	`new_cards` integer DEFAULT 0 NOT NULL,
	`ms_on_task` integer DEFAULT 0 NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`counted_for_streak` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `unit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`level_id` integer NOT NULL,
	`title` text NOT NULL,
	`ordinal` integer NOT NULL,
	FOREIGN KEY (`level_id`) REFERENCES `level`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `xp_event` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`at` integer DEFAULT (unixepoch()) NOT NULL,
	`kind` text NOT NULL,
	`amount` integer NOT NULL,
	`card_id` integer,
	`lesson_id` integer,
	FOREIGN KEY (`card_id`) REFERENCES `card`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lesson_id`) REFERENCES `lesson`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `xp_at_idx` ON `xp_event` (`at`);--> statement-breakpoint
CREATE TABLE `ja_kanji` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`character` text NOT NULL,
	`on_readings` text,
	`kun_readings` text,
	`meanings` text,
	`stroke_count` integer,
	`grade` integer,
	`frequency` integer,
	`jlpt_hint` text,
	`concept_id` integer,
	FOREIGN KEY (`concept_id`) REFERENCES `concept`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ja_kanji_character_unique` ON `ja_kanji` (`character`);--> statement-breakpoint
CREATE TABLE `ja_kanji_component` (
	`kanji_id` integer NOT NULL,
	`component` text NOT NULL,
	`position` text,
	FOREIGN KEY (`kanji_id`) REFERENCES `ja_kanji`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ja_kanji_component_uq` ON `ja_kanji_component` (`kanji_id`,`component`,`position`);--> statement-breakpoint
CREATE TABLE `ja_register_ladder` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`concept_id` integer NOT NULL,
	`gloss` text NOT NULL,
	`plain` text,
	`teineigo` text,
	`sonkeigo` text,
	`kenjougo1` text,
	`kenjougo2` text,
	`bikago` text,
	`anti_patterns` text,
	`notes` text,
	FOREIGN KEY (`concept_id`) REFERENCES `concept`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ja_ladder_concept_idx` ON `ja_register_ladder` (`concept_id`);--> statement-breakpoint
CREATE TABLE `ja_register_rule` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`audience` text NOT NULL,
	`channel` text NOT NULL,
	`expected` text NOT NULL,
	`too_high` text,
	`too_low` text,
	`evidence_tier` text DEFAULT 'T3' NOT NULL,
	`evidence_url` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ja_register_rule_uq` ON `ja_register_rule` (`audience`,`channel`,`expected`);--> statement-breakpoint
CREATE TABLE `ja_verb` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vocab_id` integer NOT NULL,
	`dictionary_form` text NOT NULL,
	`verb_class` text NOT NULL,
	`transitivity` text,
	`paired_with_id` integer,
	FOREIGN KEY (`vocab_id`) REFERENCES `ja_vocab`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ja_vocab` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`headword` text NOT NULL,
	`reading` text NOT NULL,
	`meanings` text,
	`part_of_speech` text,
	`pitch_accent` integer,
	`register` text,
	`domain` text DEFAULT 'general' NOT NULL,
	`concept_id` integer,
	FOREIGN KEY (`concept_id`) REFERENCES `concept`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ja_vocab_register_idx` ON `ja_vocab` (`register`);--> statement-breakpoint
CREATE UNIQUE INDEX `ja_vocab_uq` ON `ja_vocab` (`headword`,`reading`);