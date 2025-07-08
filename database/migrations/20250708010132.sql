-- Create "essay_packages" table
CREATE TABLE `essay_packages` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL COLLATE utf8mb4_bin,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `additional_information` text NULL,
  `price` decimal(20,2) NOT NULL,
  `total_max_attempt` int unsigned NOT NULL DEFAULT 0,
  `default_item_max_attempt` int unsigned NOT NULL DEFAULT 0,
  `is_active` bool NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NULL,
  PRIMARY KEY (`id`)
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
-- Create "essay_package_mappings" table
CREATE TABLE `essay_package_mappings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL COLLATE utf8mb4_bin,
  `essay_package_id` int unsigned NULL,
  `essay_id` int unsigned NULL,
  `max_attempt` int unsigned NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NULL,
  PRIMARY KEY (`id`),
  INDEX `essay_id` (`essay_id`),
  INDEX `essay_package_id` (`essay_package_id`),
  CONSTRAINT `essay_package_mappings_ibfk_1` FOREIGN KEY (`essay_package_id`) REFERENCES `essay_packages` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `essay_package_mappings_ibfk_2` FOREIGN KEY (`essay_id`) REFERENCES `essays` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
