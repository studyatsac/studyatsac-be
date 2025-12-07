-- Create "lead_submissions" table
CREATE TABLE `lead_submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `whatsapp_number` varchar(20) NOT NULL COMMENT 'Nomor WA user',
  `selected_program` varchar(100) NOT NULL COMMENT 'Program yang dipilih',
  `source` varchar(100) NOT NULL COMMENT 'Misal: landing_english_prep',
  `status` enum('new','contacted','converted') NOT NULL DEFAULT 'new' COMMENT 'Status lead: new / contacted / converted',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Kapan lead masuk',
  `updated_at` datetime NULL,
  PRIMARY KEY (`id`),
  INDEX `whatsapp_number` (`whatsapp_number`),
  INDEX `source` (`source`),
  INDEX `status` (`status`),
  INDEX `created_at` (`created_at`)
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
