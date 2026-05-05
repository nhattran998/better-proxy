CREATE TABLE `combos` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`models` text,
	`strategy` text DEFAULT 'fallback',
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
CREATE UNIQUE INDEX `combos_name_unique` ON `combos` (`name`);--> statement-breakpoint
CREATE TABLE `connections` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text,
	`display_name` text NOT NULL,
	`api_key` text,
	`access_token` text,
	`refresh_token` text,
	`expires_at` integer,
	`is_active` integer DEFAULT true,
	`last_used_at` integer,
	`priority` integer DEFAULT 0,
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`auth_type` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `proxy_pools` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`proxies` text,
	`strategy` text DEFAULT 'round-robin',
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
CREATE TABLE `quota` (
	`id` text PRIMARY KEY NOT NULL,
	`connection_id` text,
	`provider` text NOT NULL,
	`used_tokens` integer DEFAULT 0,
	`limit_tokens` integer,
	`reset_at` integer,
	`reset_type` text,
	FOREIGN KEY (`connection_id`) REFERENCES `connections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`requests` integer DEFAULT 0,
	`window_start` integer,
	`blocked_until` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rate_limits_key_unique` ON `rate_limits` (`key`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `usage` (
	`id` text PRIMARY KEY NOT NULL,
	`connection_id` text,
	`model` text NOT NULL,
	`input_tokens` integer DEFAULT 0,
	`output_tokens` integer DEFAULT 0,
	`total_tokens` integer DEFAULT 0,
	`cost` real DEFAULT 0,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`connection_id`) REFERENCES `connections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'user',
	`created_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);