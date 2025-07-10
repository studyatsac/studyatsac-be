-- Modify "essay_packages" table
ALTER TABLE `essay_packages`
ADD COLUMN `payment_url` varchar(255) NULL AFTER `default_item_max_attempt`;

-- Modify "user_purchases" table
ALTER TABLE `user_purchases`
MODIFY COLUMN `exam_package_id` int unsigned NULL,
ADD COLUMN `essay_package_id` int unsigned NULL AFTER `exam_package_id`,
ADD INDEX `essay_package_id` (`essay_package_id`),
ADD CONSTRAINT `user_purchases_ibfk_3` FOREIGN KEY (`essay_package_id`) REFERENCES `essay_packages` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
