-- Create "payment_logs" table
CREATE TABLE
  `payment_logs` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL COLLATE utf8mb4_unicode_ci,
    `provider` varchar(50) NOT NULL COLLATE utf8mb4_unicode_ci,
    `user_id` int unsigned NULL DEFAULT 0,
    `email` varchar(255) NOT NULL COLLATE utf8mb4_unicode_ci,
    `product_id` int unsigned NULL DEFAULT 0,
    `external_product_id` varchar(50) NULL COLLATE utf8mb4_unicode_ci,
    `exam_package_id` int unsigned NULL,
    `metadata` json NOT NULL,
    `status` varchar(20) NULL COLLATE utf8mb4_unicode_ci,
    `notes` text NULL COLLATE utf8mb4_unicode_ci,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Create "products" table
CREATE TABLE
  `products` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL COLLATE utf8mb4_unicode_ci,
    `external_product_id` varchar(50) NOT NULL COLLATE utf8mb4_unicode_ci,
    `exam_package_id` int unsigned NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Create "exam_package_categories" table
CREATE TABLE
  `exam_package_categories` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL,
    `exam_package_id` int unsigned NOT NULL,
    `master_category_id` int unsigned NOT NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create "exam_package_mappings" table
CREATE TABLE
  `exam_package_mappings` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL,
    `exam_package_id` int NOT NULL,
    `exam_id` int NOT NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create "exam_packages" table
CREATE TABLE
  `exam_packages` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL,
    `title` varchar(255) NOT NULL,
    `description` text NOT NULL,
    `image_url` varchar(255) NULL,
    `price` decimal(20, 2) NOT NULL,
    `additional_information` json NULL,
    `is_private` tinyint NULL DEFAULT 0,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create "exams" table
CREATE TABLE
  `exams` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL,
    `title` varchar(255) NOT NULL,
    `number_of_question` int NOT NULL,
    `duration` int NOT NULL COMMENT "Duration values in minutes: example 100, meaning 100 minutes",
    `description` text NULL,
    `category_id` int NOT NULL,
    `grade_rules` json NULL,
    `additional_information` json NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create "free_exam_packages" table
CREATE TABLE
  `free_exam_packages` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL,
    `exam_package_id` int unsigned NOT NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `uuid_UNIQUE` (`uuid`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create "ielts_scores" table
CREATE TABLE
  `ielts_scores` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL,
    `user_id` int unsigned NOT NULL,
    `task_id` int unsigned NULL,
    `reading_score` float NULL,
    `listening_score` float NULL,
    `overall_score` float NOT NULL,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime NULL,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Create "ielts_writing_submissions" table
CREATE TABLE
  `ielts_writing_submissions` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL,
    `user_id` int unsigned NOT NULL,
    `task_id` int unsigned NULL,
    `task_type` varchar(20) NULL,
    `topic` varchar(100) NULL,
    `writing_text` longtext NOT NULL,
    `score` float NULL,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Create "user_purchases" table
CREATE TABLE
  `user_purchases` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL,
    `user_id` int unsigned NOT NULL,
    `exam_package_id` int unsigned NOT NULL,
    `expired_at` datetime NOT NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create "event_updates" table
CREATE TABLE
  `event_updates` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL,
    `event_type` varchar(10) NOT NULL DEFAULT "online" COMMENT "value: online || offline",
    `event_title` varchar(255) NOT NULL,
    `url` varchar(255) NULL,
    `event_host` varchar(255) NULL,
    `event_platform` varchar(50) NULL,
    `start_date` datetime NOT NULL,
    `end_date` datetime NOT NULL,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime NULL,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Create "configs" table
CREATE TABLE
  `configs` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL,
    `key` varchar(100) NOT NULL,
    `value` json NOT NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create "master_categories" table
CREATE TABLE
  `master_categories` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL,
    `title` varchar(255) NOT NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create "resources" table
CREATE TABLE
  `resources` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NULL,
    `resource_name` varchar(255) NULL,
    `type` varchar(50) NOT NULL,
    `source_link` varchar(255) NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Create "user_exams" table
CREATE TABLE
  `user_exams` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NULL,
    `user_id` int unsigned NOT NULL,
    `exam_id` int unsigned NOT NULL,
    `start_date` datetime NOT NULL,
    `end_date` datetime NULL,
    `total_question` int NOT NULL,
    `total_correct_answer` int NULL DEFAULT 0,
    `total_wrong_answer` int NULL DEFAULT 0,
    `total_score` int NOT NULL DEFAULT 0,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create "user_answers" table
CREATE TABLE
  `user_answers` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL,
    `user_exam_id` int unsigned NOT NULL,
    `question_id` int unsigned NOT NULL,
    `answer` varchar(10) NOT NULL,
    `is_correct` tinyint NOT NULL DEFAULT 0,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create "selection_timelines" table
CREATE TABLE
  `selection_timelines` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL COLLATE utf8mb4_unicode_ci,
    `event_name` varchar(255) NOT NULL,
    `event_date` date NOT NULL,
    `event_color` varchar(20) NULL,
    `event_order` int unsigned NOT NULL,
    `description` text NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Create "section" table
CREATE TABLE
  `section` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL,
    `section_type` varchar(100) NOT NULL,
    `created_at` datetime NULL,
    `updated_at` datetime NULL,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `uuid` (`uuid`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Create "questions" table
CREATE TABLE
  `questions` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `resource_id` int unsigned NULL,
    `uuid` varchar(36) NOT NULL,
    `exam_id` int unsigned NOT NULL,
    `question_number` int unsigned NOT NULL,
    `question` text NOT NULL,
    `answer_option` json NOT NULL,
    `correct_answer` varchar(10) NOT NULL,
    `explanation` text NULL,
    `score` int NOT NULL DEFAULT 0,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` datetime NULL,
    `section_id` int unsigned NULL,
    PRIMARY KEY (`id`),
    INDEX `fk_questions_resource_id` (`resource_id`),
    INDEX `fk_section` (`section_id`),
    CONSTRAINT `fk_questions_resource_id` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT `fk_section` FOREIGN KEY (`section_id`) REFERENCES `section` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
  ) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create "users" table
CREATE TABLE
  `users` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL,
    `full_name` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `password` varchar(100) NOT NULL,
    `photo_url` varchar(255) NULL,
    `institution_name` varchar(255) NULL,
    `faculty` varchar(255) NULL,
    `nip` varchar(255) NULL,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` datetime NULL,
    `reset_password_token` varchar(255) NULL,
    `reset_password_token_expires` datetime NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `email_UNIQUE` (`email`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create "roles" table
CREATE TABLE
  `roles` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL,
    `name` varchar(255) NOT NULL,
    `description` varchar(255) NULL,
    `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `name` (`name`),
    UNIQUE INDEX `uuid` (`uuid`)
  ) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Create "role_users" table
CREATE TABLE
  `role_users` (
    `id` int NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL,
    `user_id` int unsigned NOT NULL,
    `role_id` int unsigned NOT NULL,
    `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `role_id` (`role_id`),
    INDEX `user_id` (`user_id`),
    UNIQUE INDEX `uuid` (`uuid`),
    CONSTRAINT `role_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT `role_users_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
  ) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;