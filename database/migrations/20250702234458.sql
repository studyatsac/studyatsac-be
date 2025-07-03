-- Modify "master_categories" table
ALTER TABLE `master_categories` COLLATE utf8mb4_0900_ai_ci, MODIFY COLUMN `uuid` varchar(36) NOT NULL, MODIFY COLUMN `title` varchar(255) NOT NULL, MODIFY COLUMN `updated_at` datetime NOT NULL;
-- Modify "event_updates" table
ALTER TABLE `event_updates` MODIFY COLUMN `event_type` varchar(10) NOT NULL, MODIFY COLUMN `event_platform` varchar(255) NULL, MODIFY COLUMN `created_at` datetime NOT NULL, MODIFY COLUMN `updated_at` datetime NOT NULL;
-- Modify "selection_timelines" table
ALTER TABLE `selection_timelines` MODIFY COLUMN `uuid` varchar(36) NOT NULL, MODIFY COLUMN `event_date` datetime NOT NULL, MODIFY COLUMN `event_order` int NOT NULL, MODIFY COLUMN `description` varchar(255) NULL, MODIFY COLUMN `updated_at` datetime NOT NULL;
-- Modify "exam_packages" table
ALTER TABLE `exam_packages` COLLATE utf8mb4_0900_ai_ci, MODIFY COLUMN `uuid` varchar(36) NOT NULL, MODIFY COLUMN `title` varchar(255) NOT NULL, MODIFY COLUMN `description` text NOT NULL, MODIFY COLUMN `image_url` varchar(255) NULL, MODIFY COLUMN `is_private` bool NULL DEFAULT 0, MODIFY COLUMN `updated_at` datetime NOT NULL;
-- Modify "configs" table
ALTER TABLE `configs` COLLATE utf8mb4_0900_ai_ci, MODIFY COLUMN `uuid` varchar(36) NOT NULL, MODIFY COLUMN `key` varchar(100) NOT NULL, MODIFY COLUMN `updated_at` datetime NOT NULL;
-- Modify "payment_logs" table
ALTER TABLE `payment_logs` MODIFY COLUMN `uuid` varchar(36) NOT NULL, MODIFY COLUMN `provider` varchar(50) NOT NULL, MODIFY COLUMN `user_id` int unsigned NULL, MODIFY COLUMN `email` varchar(255) NOT NULL, MODIFY COLUMN `product_id` int unsigned NULL, MODIFY COLUMN `external_product_id` varchar(50) NULL, MODIFY COLUMN `status` varchar(20) NULL, MODIFY COLUMN `notes` text NULL, MODIFY COLUMN `updated_at` datetime NOT NULL;
-- Modify "exam_package_categories" table
ALTER TABLE `exam_package_categories` COLLATE utf8mb4_0900_ai_ci, MODIFY COLUMN `uuid` varchar(36) NOT NULL, MODIFY COLUMN `exam_package_id` int unsigned NULL, MODIFY COLUMN `updated_at` datetime NOT NULL, ADD INDEX `exam_package_id` (`exam_package_id`), ADD CONSTRAINT `exam_package_categories_ibfk_1` FOREIGN KEY (`exam_package_id`) REFERENCES `exam_packages` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
-- Modify "exams" table
ALTER TABLE `exams` COLLATE utf8mb4_0900_ai_ci, MODIFY COLUMN `uuid` varchar(36) NOT NULL, MODIFY COLUMN `title` varchar(255) NOT NULL, MODIFY COLUMN `number_of_question` int unsigned NOT NULL, MODIFY COLUMN `duration` int unsigned NOT NULL, MODIFY COLUMN `description` text NOT NULL, MODIFY COLUMN `category_id` int unsigned NOT NULL, MODIFY COLUMN `updated_at` datetime NOT NULL;
-- Modify "exam_package_mappings" table
ALTER TABLE `exam_package_mappings` COLLATE utf8mb4_0900_ai_ci, MODIFY COLUMN `uuid` varchar(36) NOT NULL, MODIFY COLUMN `exam_package_id` int unsigned NOT NULL, MODIFY COLUMN `exam_id` int unsigned NULL, MODIFY COLUMN `updated_at` datetime NOT NULL, ADD INDEX `exam_id` (`exam_id`), ADD CONSTRAINT `exam_package_mappings_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
-- Modify "free_exam_packages" table
ALTER TABLE `free_exam_packages` COLLATE utf8mb4_0900_ai_ci, MODIFY COLUMN `uuid` varchar(36) NOT NULL, MODIFY COLUMN `exam_package_id` int unsigned NULL, MODIFY COLUMN `updated_at` datetime NOT NULL, DROP INDEX `uuid_UNIQUE`, ADD INDEX `exam_package_id` (`exam_package_id`), ADD CONSTRAINT `free_exam_packages_ibfk_1` FOREIGN KEY (`exam_package_id`) REFERENCES `exam_packages` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
-- Modify "users" table
ALTER TABLE `users` COLLATE utf8mb4_0900_ai_ci, MODIFY COLUMN `uuid` varchar(36) NOT NULL, MODIFY COLUMN `full_name` varchar(255) NOT NULL, MODIFY COLUMN `email` varchar(255) NOT NULL, MODIFY COLUMN `password` varchar(100) NOT NULL, DROP COLUMN `photo_url`, MODIFY COLUMN `institution_name` varchar(255) NULL, MODIFY COLUMN `faculty` varchar(255) NULL, MODIFY COLUMN `nip` varchar(255) NULL, MODIFY COLUMN `created_at` datetime NOT NULL, MODIFY COLUMN `updated_at` datetime NOT NULL, MODIFY COLUMN `reset_password_token` varchar(255) NULL, RENAME INDEX `email_UNIQUE` TO `email`, ADD UNIQUE INDEX `reset_password_token` (`reset_password_token`), ADD UNIQUE INDEX `reset_password_token_expires` (`reset_password_token_expires`);
-- Modify "ielts_scores" table
ALTER TABLE `ielts_scores` MODIFY COLUMN `user_id` int unsigned NULL, MODIFY COLUMN `reading_score` int NULL, MODIFY COLUMN `listening_score` int NULL, MODIFY COLUMN `overall_score` int NOT NULL, MODIFY COLUMN `created_at` datetime NOT NULL, MODIFY COLUMN `updated_at` datetime NOT NULL, ADD INDEX `user_id` (`user_id`), ADD CONSTRAINT `ielts_scores_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
-- Modify "ielts_writing_submissions" table
ALTER TABLE `ielts_writing_submissions` MODIFY COLUMN `user_id` int unsigned NULL, MODIFY COLUMN `writing_text` varchar(255) NOT NULL, MODIFY COLUMN `score` int NULL, MODIFY COLUMN `created_at` datetime NOT NULL, MODIFY COLUMN `updated_at` datetime NOT NULL, ADD INDEX `user_id` (`user_id`), ADD CONSTRAINT `ielts_writing_submissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
-- Modify "products" table
ALTER TABLE `products` MODIFY COLUMN `uuid` varchar(36) NOT NULL, MODIFY COLUMN `external_product_id` varchar(50) NOT NULL, MODIFY COLUMN `updated_at` datetime NOT NULL, ADD INDEX `exam_package_id` (`exam_package_id`), ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`exam_package_id`) REFERENCES `exam_packages` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
-- Modify "resources" table
ALTER TABLE `resources` MODIFY COLUMN `uuid` varchar(36) NOT NULL, MODIFY COLUMN `resource_name` varchar(255) NOT NULL, MODIFY COLUMN `source_link` varchar(255) NOT NULL, MODIFY COLUMN `created_at` datetime NOT NULL, MODIFY COLUMN `updated_at` datetime NOT NULL;
-- Modify "section" table
ALTER TABLE `section` MODIFY COLUMN `created_at` datetime NOT NULL, MODIFY COLUMN `updated_at` datetime NOT NULL;
-- Modify "questions" table
ALTER TABLE `questions` COLLATE utf8mb4_0900_ai_ci, MODIFY COLUMN `uuid` varchar(36) NOT NULL, MODIFY COLUMN `question` text NOT NULL, MODIFY COLUMN `correct_answer` varchar(10) NOT NULL, MODIFY COLUMN `explanation` text NULL, MODIFY COLUMN `score` int unsigned NULL, MODIFY COLUMN `updated_at` datetime NOT NULL, RENAME INDEX `fk_questions_resource_id` TO `resource_id`, RENAME INDEX `fk_section` TO `section_id`, DROP FOREIGN KEY `fk_questions_resource_id`, DROP FOREIGN KEY `fk_section`, ADD CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`id`) ON UPDATE CASCADE ON DELETE SET NULL, ADD CONSTRAINT `questions_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `section` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
-- Create "questions_resources" table
CREATE TABLE `questions_resources` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) NOT NULL,
  `resource_id` int unsigned NOT NULL,
  `question_id` int unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NULL,
  PRIMARY KEY (`id`),
  INDEX `question_id` (`question_id`),
  INDEX `resource_id` (`resource_id`),
  CONSTRAINT `questions_resources_ibfk_1` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`id`) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT `questions_resources_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON UPDATE CASCADE ON DELETE NO ACTION
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
-- Modify "roles" table
ALTER TABLE `roles` MODIFY COLUMN `created_at` datetime NOT NULL, MODIFY COLUMN `updated_at` datetime NOT NULL;
-- Modify "role_users" table
ALTER TABLE `role_users` DROP FOREIGN KEY `role_users_ibfk_1`, DROP FOREIGN KEY `role_users_ibfk_2`;
-- Modify "role_users" table
ALTER TABLE `role_users` MODIFY COLUMN `id` int unsigned NOT NULL AUTO_INCREMENT, MODIFY COLUMN `created_at` datetime NOT NULL, MODIFY COLUMN `updated_at` datetime NOT NULL, ADD CONSTRAINT `role_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE NO ACTION, ADD CONSTRAINT `role_users_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE ON DELETE NO ACTION;
-- Modify "user_answers" table
ALTER TABLE `user_answers` COLLATE utf8mb4_0900_ai_ci, MODIFY COLUMN `uuid` varchar(36) NOT NULL, MODIFY COLUMN `question_id` int unsigned NULL, MODIFY COLUMN `answer` varchar(10) NOT NULL, MODIFY COLUMN `is_correct` bool NOT NULL, MODIFY COLUMN `updated_at` datetime NOT NULL, ADD INDEX `question_id` (`question_id`), ADD CONSTRAINT `user_answers_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
-- Modify "user_exams" table
ALTER TABLE `user_exams` COLLATE utf8mb4_0900_ai_ci, MODIFY COLUMN `uuid` varchar(36) NOT NULL, MODIFY COLUMN `user_id` int unsigned NULL, MODIFY COLUMN `exam_id` int unsigned NULL, MODIFY COLUMN `total_correct_answer` int NULL, MODIFY COLUMN `total_wrong_answer` int NULL, MODIFY COLUMN `total_score` int NULL, MODIFY COLUMN `updated_at` datetime NOT NULL, ADD INDEX `exam_id` (`exam_id`), ADD INDEX `user_id` (`user_id`), ADD CONSTRAINT `user_exams_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE SET NULL, ADD CONSTRAINT `user_exams_ibfk_2` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
-- Modify "user_purchases" table
ALTER TABLE `user_purchases` COLLATE utf8mb4_0900_ai_ci, MODIFY COLUMN `uuid` varchar(36) NOT NULL, MODIFY COLUMN `user_id` int unsigned NULL, MODIFY COLUMN `exam_package_id` int unsigned NULL, MODIFY COLUMN `updated_at` datetime NOT NULL, ADD INDEX `exam_package_id` (`exam_package_id`), ADD INDEX `user_id` (`user_id`), ADD CONSTRAINT `user_purchases_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE SET NULL, ADD CONSTRAINT `user_purchases_ibfk_2` FOREIGN KEY (`exam_package_id`) REFERENCES `exam_packages` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
