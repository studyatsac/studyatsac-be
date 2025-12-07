-- Create "certificates" table
CREATE TABLE `certificates` (
  `certificate_id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `exam_id` int unsigned NOT NULL,
  `certificate_code` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`certificate_id`),
  INDEX `user_id` (`user_id`),
  INDEX `exam_id` (`exam_id`),
  CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT `certificates_ibfk_2` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON UPDATE CASCADE ON DELETE NO ACTION
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Create "placement_test" table
CREATE TABLE `placement_test` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) NOT NULL,
  `user_id` int unsigned NOT NULL,
  `test_name` varchar(255) NOT NULL,
  `score` float NOT NULL,
  `created_at` datetime NULL,
  `updated_at` datetime NULL,
  `deleted_at` datetime NULL,
  PRIMARY KEY (`id`),
  INDEX `user_id` (`user_id`),
  CONSTRAINT `placement_test_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE NO ACTION
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Create "promos" table
CREATE TABLE `promos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) NOT NULL,
  `promo_name` varchar(255) NOT NULL,
  `poster_link` varchar(255) NULL,
  `link_promo` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE INDEX `id` (`id`)
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Create "scholarships" table
CREATE TABLE `scholarships` (
  `uuid` varchar(36) NOT NULL,
  `scholarship_name` varchar(255) NOT NULL,
  `open_date` date NOT NULL,
  `closed_date` date NOT NULL,
  `level` enum('D3','D4','S1','S2','S3') NOT NULL,
  `type` enum('full_funded','partially_funded','self_funded') NOT NULL,
  `country` varchar(255) NOT NULL,
  `university` varchar(255) NOT NULL,
  `status` tinyint NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NULL,
  PRIMARY KEY (`uuid`)
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Create "scholarship_details" table
CREATE TABLE `scholarship_details` (
  `uuid` varchar(36) NOT NULL,
  `scholarship_id` varchar(36) NOT NULL,
  `description` text NULL,
  `requirement` text NULL,
  `benefit` text NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NULL,
  PRIMARY KEY (`uuid`),
  INDEX `scholarship_id` (`scholarship_id`),
  CONSTRAINT `scholarship_details_ibfk_1` FOREIGN KEY (`scholarship_id`) REFERENCES `scholarships` (`uuid`) ON UPDATE CASCADE ON DELETE NO ACTION
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Create "user_reviews" table
CREATE TABLE `user_reviews` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) NOT NULL,
  `user_id` int unsigned NOT NULL,
  `rating` tinyint unsigned NULL,
  `comment` text NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NULL,
  PRIMARY KEY (`id`),
  INDEX `user_id` (`user_id`),
  CONSTRAINT `user_reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE NO ACTION
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
