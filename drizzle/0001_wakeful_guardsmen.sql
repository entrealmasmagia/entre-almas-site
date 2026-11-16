CREATE TABLE `availability` (
	`start` integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `installments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`part` integer NOT NULL,
	`amount` integer NOT NULL,
	`due` text,
	`paid` integer DEFAULT 0 NOT NULL,
	`checkout` text,
	`transaction` text,
	`method` text,
	`paid_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `installments_transaction_unique` ON `installments` (`transaction`);--> statement-breakpoint
CREATE TABLE `loyalty` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`order_id` text,
	`points` integer NOT NULL,
	`description` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `loyalty_order_id_unique` ON `loyalty` (`order_id`);--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`customer` text NOT NULL,
	`service_id` text NOT NULL,
	`status` text NOT NULL,
	`amount` integer,
	`proposal` text,
	`order_id` text,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quotes_order_id_unique` ON `quotes` (`order_id`);--> statement-breakpoint
CREATE TABLE `reservations` (
	`start` integer PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`service_id` text NOT NULL,
	`expires` integer
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_mode` text DEFAULT 'pix' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `paid_amount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `settled_at` text;--> statement-breakpoint
CREATE TRIGGER reservations_available BEFORE INSERT ON reservations
WHEN NOT EXISTS(SELECT 1 FROM availability WHERE start=NEW.start)
BEGIN SELECT RAISE(ABORT,'SLOT_UNAVAILABLE'); END;
--> statement-breakpoint
CREATE TRIGGER loyalty_balance BEFORE INSERT ON loyalty
WHEN NEW.points<0 AND COALESCE((SELECT SUM(points) FROM loyalty WHERE owner=NEW.owner),0)+NEW.points<0
BEGIN SELECT RAISE(ABORT,'INSUFFICIENT_POINTS'); END;
--> statement-breakpoint
CREATE INDEX reservations_order ON reservations(order_id);
--> statement-breakpoint
CREATE INDEX installments_order ON installments(order_id);
--> statement-breakpoint
CREATE UNIQUE INDEX installment_part ON installments(order_id,part);
--> statement-breakpoint
CREATE INDEX loyalty_owner ON loyalty(owner);
--> statement-breakpoint
CREATE UNIQUE INDEX orders_quote_unique ON orders(json_extract(customer,'$.quote')) WHERE json_extract(customer,'$.quote') IS NOT NULL;
--> statement-breakpoint
CREATE TRIGGER installments_legacy_transaction BEFORE UPDATE OF `transaction` ON installments
WHEN NEW.`transaction` IS NOT NULL AND EXISTS(SELECT 1 FROM orders WHERE `transaction`=NEW.`transaction`)
BEGIN SELECT RAISE(ABORT,'TRANSACTION_ALREADY_USED'); END;
--> statement-breakpoint
CREATE TRIGGER orders_installment_transaction BEFORE UPDATE OF `transaction` ON orders
WHEN NEW.`transaction` IS NOT NULL AND EXISTS(SELECT 1 FROM installments WHERE `transaction`=NEW.`transaction`)
BEGIN SELECT RAISE(ABORT,'TRANSACTION_ALREADY_USED'); END;
