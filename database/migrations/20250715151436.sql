-- Create "interviews" table
CREATE TABLE `interviews` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL COLLATE utf8mb4_bin,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `is_active` bool NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NULL,
  PRIMARY KEY (`id`)
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
-- Create "interview_sections" table
CREATE TABLE `interview_sections` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL COLLATE utf8mb4_bin,
  `interview_id` int unsigned NULL,
  `number` int NOT NULL DEFAULT 0,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `system_prompt` text NOT NULL,
  `duration` int unsigned NOT NULL DEFAULT 900,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NULL,
  PRIMARY KEY (`id`),
  INDEX `interview_id` (`interview_id`),
  CONSTRAINT `interview_sections_ibfk_1` FOREIGN KEY (`interview_id`) REFERENCES `interviews` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
-- Create "interview_section_questions" table
CREATE TABLE `interview_section_questions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL COLLATE utf8mb4_bin,
  `section_id` int unsigned NULL,
  `number` int NOT NULL DEFAULT 0,
  `question` text NOT NULL,
  `system_prompt` text NULL,
  `hint` text NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NULL,
  PRIMARY KEY (`id`),
  INDEX `section_id` (`section_id`),
  CONSTRAINT `interview_section_questions_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `interview_sections` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
