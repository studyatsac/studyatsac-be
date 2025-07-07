-- Modify "user_essay_items" table
ALTER TABLE `user_essay_items`
ADD COLUMN `review_status` varchar(30) NOT NULL DEFAULT "not_started" AFTER `review`;

-- Modify "user_essays" table
ALTER TABLE `user_essays`
ADD COLUMN `item_review_status` varchar(30) NOT NULL DEFAULT "not_started" AFTER `overall_review`,
ADD COLUMN `overall_review_status` varchar(30) NOT NULL DEFAULT "not_started" AFTER `item_review_status`;