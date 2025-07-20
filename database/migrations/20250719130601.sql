-- Modify "essay_package_mappings" table
ALTER TABLE `essay_package_mappings` DROP FOREIGN KEY `essay_package_mappings_ibfk_1`;
-- Modify "products" table
ALTER TABLE `products` DROP FOREIGN KEY `products_ibfk_2`;
-- Modify "user_essays" table
ALTER TABLE `user_essays` DROP FOREIGN KEY `user_essays_ibfk_3`;
-- Modify "user_purchases" table
ALTER TABLE `user_purchases` DROP FOREIGN KEY `user_purchases_ibfk_3`;
-- Modify "essay_packages" table
ALTER TABLE `essay_packages` RENAME TO `product_packages`;
-- Modify "essay_package_mappings" table
ALTER TABLE `essay_package_mappings` RENAME TO `product_package_mappings`;
-- Modify "product_package_mappings" table
ALTER TABLE `product_package_mappings` RENAME COLUMN `essay_package_id` TO `product_package_id`, DROP INDEX `essay_package_id`, ADD INDEX `product_package_id` (`product_package_id`), ADD CONSTRAINT `product_package_mappings_ibfk_1` FOREIGN KEY (`product_package_id`) REFERENCES `product_packages` (`id`) ON UPDATE CASCADE ON DELETE CASCADE;
-- Modify "product_packages" table
ALTER TABLE `product_packages` ADD COLUMN `type` varchar(30) NOT NULL DEFAULT "essay" AFTER `uuid`; 
-- Modify "payment_logs" table
ALTER TABLE `payment_logs` RENAME COLUMN `essay_package_id` TO `product_package_id`;
-- Modify "products" table
ALTER TABLE `products` RENAME COLUMN `essay_package_id` TO `product_package_id`, DROP INDEX `essay_package_id`, ADD INDEX `product_package_id` (`product_package_id`), ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`product_package_id`) REFERENCES `product_packages` (`id`) ON UPDATE CASCADE ON DELETE CASCADE;
-- Modify "user_essays" table
ALTER TABLE `user_essays` RENAME COLUMN `essay_package_id` TO `product_package_id`, DROP INDEX `essay_package_id`, ADD INDEX `product_package_id` (`product_package_id`), ADD CONSTRAINT `user_essays_ibfk_3` FOREIGN KEY (`product_package_id`) REFERENCES `product_packages` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
-- Modify "user_purchases" table
ALTER TABLE `user_purchases` RENAME COLUMN `essay_package_id` TO `product_package_id`, DROP INDEX `essay_package_id`, ADD INDEX `product_package_id` (`product_package_id`), ADD CONSTRAINT `user_purchases_ibfk_3` FOREIGN KEY (`product_package_id`) REFERENCES `product_packages` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
