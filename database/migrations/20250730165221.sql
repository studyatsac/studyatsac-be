-- Modify "user_interview_section_answers" table
ALTER TABLE `user_interview_section_answers` ADD COLUMN `question_number` int NULL AFTER `answered_at`, ADD COLUMN `question` text NULL AFTER `question_number`;
