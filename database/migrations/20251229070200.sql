-- Create popups table for dynamic landing page popup management
CREATE TABLE `popups` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `uuid` VARCHAR(36) NOT NULL UNIQUE COMMENT 'Unique identifier for API',
  `title` VARCHAR(255) NOT NULL COMMENT 'Judul popup (untuk referensi admin)',
  `description` TEXT NULL COMMENT 'Deskripsi popup (opsional, untuk admin)',
  `image_url` VARCHAR(500) NOT NULL COMMENT 'URL gambar popup',
  `link_url` VARCHAR(500) NOT NULL COMMENT 'URL tujuan ketika diklik',
  `start_date` DATETIME NULL COMMENT 'Tanggal mulai aktif (NULL = selalu aktif)',
  `end_date` DATETIME NULL COMMENT 'Tanggal selesai (NULL = tidak ada batas)',
  `priority` INT NOT NULL DEFAULT 0 COMMENT 'Priority popup (lebih tinggi = lebih prioritas)',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '0 = inactive, 1 = active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` INT NULL COMMENT 'User ID yang membuat',
  `updated_by` INT NULL COMMENT 'User ID yang update',
  
  INDEX `idx_uuid` (`uuid`),
  INDEX `idx_status` (`status`),
  INDEX `idx_dates` (`start_date`, `end_date`),
  INDEX `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
