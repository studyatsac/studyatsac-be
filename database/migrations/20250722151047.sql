-- Modify "user_interview_sections" table
ALTER TABLE `user_interview_sections` ADD COLUMN `paused_at` datetime NULL AFTER `started_at`;
-- Modify "user_interviews" table
ALTER TABLE `user_interviews` ADD COLUMN `paused_at` datetime NULL AFTER `started_at`;
