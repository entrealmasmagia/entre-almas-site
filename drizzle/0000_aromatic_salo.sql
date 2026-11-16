CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`customer` text NOT NULL,
	`items` text NOT NULL,
	`subtotal` integer NOT NULL,
	`fees` integer NOT NULL,
	`discount` integer DEFAULT 0 NOT NULL,
	`total` integer NOT NULL,
	`requested` integer DEFAULT 0 NOT NULL,
	`status` text NOT NULL,
	`paid` integer DEFAULT 0 NOT NULL,
	`transaction` text,
	`checkout` text,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_transaction_unique` ON `orders` (`transaction`);--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
