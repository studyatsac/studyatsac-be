-- Modify "essays" table
ALTER TABLE `essays` ADD COLUMN `is_active` bool NOT NULL DEFAULT 1 AFTER `description`;
