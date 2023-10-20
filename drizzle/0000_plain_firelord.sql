CREATE TABLE `application_accounts` (
	`id` integer PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`token_secret` text,
	`extra` text DEFAULT '{}',
	`status` text DEFAULT 'NEW',
	`updated_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`expires_at` integer,
	`application_id` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_code` text NOT NULL,
	`client_id` text
);
--> statement-breakpoint
CREATE TABLE `data_node` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`node_type` text NOT NULL,
	`cloud_id` text NOT NULL,
	`metadata` text,
	`application_id` integer NOT NULL,
	`application_account_id` integer NOT NULL,
	`parent_data_node_id` integer,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`application_account_id`) REFERENCES `application_accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_data_node_id`) REFERENCES `data_node`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quick_actions` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`fields` text DEFAULT '[]',
	`application_account_id` integer NOT NULL,
	`updated_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`application_account_id`) REFERENCES `application_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `short_code_idx` ON `applications` (`short_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `name_client_id_idx` ON `applications` (`name`,`client_id`);--> statement-breakpoint
CREATE INDEX `node_type_idx` ON `data_node` (`node_type`);--> statement-breakpoint
CREATE UNIQUE INDEX `data_node_application_account_id_node_type_cloud_id_unique` ON `data_node` (`application_account_id`,`node_type`,`cloud_id`);