-- Modify "user_essays" table
ALTER TABLE `user_essays` ADD COLUMN `essay_package_id` int unsigned NULL AFTER `essay_id`, ADD INDEX `essay_package_id` (`essay_package_id`), ADD CONSTRAINT `user_essays_ibfk_3` FOREIGN KEY (`essay_package_id`) REFERENCES `essay_packages` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
