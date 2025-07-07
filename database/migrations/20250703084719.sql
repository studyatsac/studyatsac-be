-- Create "essays" table
CREATE TABLE
  `essays` (
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

-- Create "essay_items" table
CREATE TABLE
  `essay_items` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` char(36) NOT NULL COLLATE utf8mb4_bin,
    `essay_id` int unsigned NULL,
    `number` int NOT NULL,
    `topic` varchar(255) NOT NULL,
    `description` text NOT NULL,
    `system_prompt` text NOT NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`),
    INDEX `essay_id` (`essay_id`),
    CONSTRAINT `essay_items_ibfk_1` FOREIGN KEY (`essay_id`) REFERENCES `essays` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
  ) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Create "user_essays" table
CREATE TABLE
  `user_essays` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` char(36) NOT NULL COLLATE utf8mb4_bin,
    `user_id` int unsigned NULL,
    `essay_id` int unsigned NULL,
    `overall_review` text NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`),
    INDEX `essay_id` (`essay_id`),
    INDEX `user_id` (`user_id`),
    CONSTRAINT `user_essays_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT `user_essays_ibfk_2` FOREIGN KEY (`essay_id`) REFERENCES `essays` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
  ) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Create "user_essay_items" table
CREATE TABLE
  `user_essay_items` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `uuid` char(36) NOT NULL COLLATE utf8mb4_bin,
    `user_essay_id` int unsigned NULL,
    `essay_item_id` int unsigned NULL,
    `answer` text NOT NULL,
    `review` text NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    `deleted_at` datetime NULL,
    PRIMARY KEY (`id`),
    INDEX `essay_item_id` (`essay_item_id`),
    INDEX `user_essay_id` (`user_essay_id`),
    CONSTRAINT `user_essay_items_ibfk_1` FOREIGN KEY (`user_essay_id`) REFERENCES `user_essays` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `user_essay_items_ibfk_2` FOREIGN KEY (`essay_item_id`) REFERENCES `essay_items` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
  ) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;