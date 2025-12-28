-- Add application_link column to scholarships table
ALTER TABLE `scholarships` 
ADD COLUMN `application_link` VARCHAR(500) NULL COMMENT 'URL link to scholarship application page' 
AFTER `university`;
