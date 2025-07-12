-- Create "essay_review_logs" table
CREATE TABLE `essay_review_logs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL COLLATE utf8mb4_bin,
  `user_essay_id` int unsigned NOT NULL,
  `metadata` json NULL,
  `notes` text NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NULL,
  PRIMARY KEY (`id`)
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
