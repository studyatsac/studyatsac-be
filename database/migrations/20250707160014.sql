-- Modify "user_essays" table
ALTER TABLE `user_essays` ADD COLUMN `language` varchar(20) NULL AFTER `overall_review_status`;
