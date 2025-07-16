-- Create "user_interviews" table
CREATE TABLE `user_interviews` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL COLLATE utf8mb4_bin,
  `user_id` int unsigned NULL,
  `interview_id` int unsigned NULL,
  `status` varchar(30) NOT NULL DEFAULT "not_started",
  `started_at` datetime NULL,
  `completed_at` datetime NULL,
  `overall_review` text NULL,
  `overall_review_status` varchar(30) NOT NULL DEFAULT "not_started",
  `language` varchar(20) NULL,
  `background_description` text NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NULL,
  PRIMARY KEY (`id`),
  INDEX `interview_id` (`interview_id`),
  INDEX `user_id` (`user_id`),
  CONSTRAINT `user_interviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `user_interviews_ibfk_2` FOREIGN KEY (`interview_id`) REFERENCES `interviews` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
-- Create "user_interview_sections" table
CREATE TABLE `user_interview_sections` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL COLLATE utf8mb4_bin,
  `user_interview_id` int unsigned NULL,
  `section_id` int unsigned NULL,
  `status` varchar(30) NOT NULL DEFAULT "not_started",
  `started_at` datetime NULL,
  `completed_at` datetime NULL,
  `review` text NULL,
  `review_status` varchar(30) NOT NULL DEFAULT "not_started",
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NULL,
  PRIMARY KEY (`id`),
  INDEX `section_id` (`section_id`),
  INDEX `user_interview_id` (`user_interview_id`),
  CONSTRAINT `user_interview_sections_ibfk_1` FOREIGN KEY (`user_interview_id`) REFERENCES `user_interviews` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `user_interview_sections_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `interview_sections` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
-- Create "user_interview_section_answers" table
CREATE TABLE `user_interview_section_answers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL COLLATE utf8mb4_bin,
  `user_interview_section_id` int unsigned NULL,
  `question_id` int unsigned NULL,
  `status` varchar(30) NOT NULL DEFAULT "not_started",
  `asked_at` datetime NULL,
  `answered_at` datetime NULL,
  `answer` text NULL,
  `review` text NULL,
  `review_status` varchar(30) NOT NULL DEFAULT "not_started",
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NULL,
  PRIMARY KEY (`id`),
  INDEX `question_id` (`question_id`),
  INDEX `user_interview_section_id` (`user_interview_section_id`),
  CONSTRAINT `user_interview_section_answers_ibfk_1` FOREIGN KEY (`user_interview_section_id`) REFERENCES `user_interview_sections` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `user_interview_section_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `interview_section_questions` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
