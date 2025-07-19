-- Modify "essay_package_mappings" table
ALTER TABLE `essay_package_mappings` RENAME COLUMN `essay_package_id` TO `product_package_id`, DROP INDEX `essay_package_id`, ADD INDEX `product_package_id` (`product_package_id`);
-- Modify "essay_packages" table
ALTER TABLE `essay_packages` ADD COLUMN `type` varchar(20) NULL AFTER `uuid`;
-- Modify "payment_logs" table
ALTER TABLE `payment_logs` RENAME COLUMN `essay_package_id` TO `product_package_id`;
-- Modify "products" table
ALTER TABLE `products` RENAME COLUMN `essay_package_id` TO `product_package_id`, DROP INDEX `essay_package_id`, ADD INDEX `product_package_id` (`product_package_id`);
-- Modify "user_essays" table
ALTER TABLE `user_essays` RENAME COLUMN `essay_package_id` TO `product_package_id`, DROP INDEX `essay_package_id`, ADD INDEX `product_package_id` (`product_package_id`);
-- Modify "user_purchases" table
ALTER TABLE `user_purchases` RENAME COLUMN `essay_package_id` TO `product_package_id`, DROP INDEX `essay_package_id`, ADD INDEX `product_package_id` (`product_package_id`);
