ALTER TABLE `card` ADD `authoring_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `card_authoring_key` ON `card` (`concept_id`,`type`,`authoring_key`);