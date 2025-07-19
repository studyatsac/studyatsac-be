-- Modify "product_package_mappings" table
ALTER TABLE `product_package_mappings` ADD COLUMN `interview_id` int unsigned NULL AFTER `essay_id`, ADD INDEX `interview_id` (`interview_id`), ADD CONSTRAINT `product_package_mappings_ibfk_3` FOREIGN KEY (`interview_id`) REFERENCES `interviews` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
-- Modify "user_interviews" table
ALTER TABLE `user_interviews` ADD COLUMN `product_package_id` int unsigned NULL AFTER `interview_id`, ADD INDEX `product_package_id` (`product_package_id`), ADD CONSTRAINT `user_interviews_ibfk_3` FOREIGN KEY (`product_package_id`) REFERENCES `product_packages` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
