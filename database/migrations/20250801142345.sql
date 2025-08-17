-- Modify "user_interview_sections" table
ALTER TABLE `user_interview_sections` ADD COLUMN `resumed_at` datetime NULL AFTER `paused_at`, ADD COLUMN `duration` int unsigned NOT NULL DEFAULT 0 AFTER `completed_at`;
-- Modify "user_interviews" table
ALTER TABLE `user_interviews` ADD COLUMN `resumed_at` datetime NULL AFTER `paused_at`;
