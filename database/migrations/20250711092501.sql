-- Modify "payment_logs" table
ALTER TABLE `payment_logs` ADD COLUMN `external_product_name` varchar(255) NULL AFTER `external_product_id`, ADD COLUMN `external_ticket_id` varchar(50) NULL AFTER `external_product_name`, ADD COLUMN `external_ticket_name` varchar(255) NULL AFTER `external_ticket_id`, ADD COLUMN `essay_package_id` int unsigned NULL AFTER `exam_package_id`;
-- Modify "user_purchases" table
ALTER TABLE `user_purchases` ADD COLUMN `external_transaction_id` varchar(50) NULL AFTER `uuid`;
-- Modify "products" table
ALTER TABLE `products` MODIFY COLUMN `external_product_id` varchar(50) NULL, ADD COLUMN `external_product_name` varchar(255) NULL AFTER `external_product_id`, ADD COLUMN `external_ticket_id` varchar(50) NULL AFTER `external_product_name`, ADD COLUMN `external_ticket_name` varchar(255) NULL AFTER `external_ticket_id`, ADD COLUMN `essay_package_id` int unsigned NULL AFTER `exam_package_id`, ADD INDEX `essay_package_id` (`essay_package_id`), ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`essay_package_id`) REFERENCES `essay_packages` (`id`) ON UPDATE CASCADE ON DELETE CASCADE;
