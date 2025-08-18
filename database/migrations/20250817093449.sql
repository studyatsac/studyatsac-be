-- Modify "user_interview_sections" table
ALTER TABLE `user_interview_sections` ADD COLUMN `language` varchar(20) NULL AFTER `answer_review_status`;
