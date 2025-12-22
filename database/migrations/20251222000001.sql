-- Migration: Replace certificate_name with exam_id
-- Date: 2025-12-22
-- Description: Update certificates table to link directly to exams via exam_id instead of certificate_name

-- Step 1: Add exam_id column
ALTER TABLE `certificates` 
ADD COLUMN `exam_id` INT UNSIGNED NULL COMMENT 'Foreign key to exams table' AFTER `user_id`;

-- Step 2: Add index on exam_id for performance
ALTER TABLE `certificates` 
ADD INDEX `idx_exam_id` (`exam_id`);

-- Step 3: Add foreign key constraint
ALTER TABLE `certificates` 
ADD CONSTRAINT `fk_certificates_exam_id` 
FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) 
ON UPDATE CASCADE 
ON DELETE CASCADE;

-- Step 4: Make exam_id NOT NULL after data migration
-- NOTE: If you have existing data, you need to populate exam_id values before running this step
-- Example data migration (customize based on your needs):
-- UPDATE certificates c
-- JOIN exams e ON c.certificate_name = e.title
-- SET c.exam_id = e.id;

ALTER TABLE `certificates` 
MODIFY `exam_id` INT UNSIGNED NOT NULL COMMENT 'Foreign key to exams table';

-- Step 5: Drop the old certificate_name column
ALTER TABLE `certificates` 
DROP COLUMN `certificate_name`;
