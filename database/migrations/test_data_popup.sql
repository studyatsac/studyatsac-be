-- Example test data for popups table
-- Run this after running the migration to create the table

-- Example 1: High priority active popup (currently active)
INSERT INTO `popups` (
    `uuid`, 
    `title`, 
    `description`, 
    `image_url`, 
    `link_url`, 
    `start_date`, 
    `end_date`, 
    `priority`, 
    `status`, 
    `created_by`
) VALUES (
    UUID(),
    'IELTS with Experts Program',
    'Promo spesial untuk IELTS dengan expert tutor',
    'https://media-myr.b-cdn.net/images/resized/1080/5b30377b-b135-4e92-a392-d4851ec78f54.jpeg',
    'https://bit.ly/IELTSwithExpertsSAC',
    '2025-01-01 00:00:00',
    '2025-12-31 23:59:59',
    10,
    1,
    1
);

-- Example 2: Medium priority active popup (no end date)
INSERT INTO `popups` (
    `uuid`, 
    `title`, 
    `description`, 
    `image_url`, 
    `link_url`, 
    `start_date`, 
    `end_date`, 
    `priority`, 
    `status`, 
    `created_by`
) VALUES (
    UUID(),
    'Study Abroad Consultation',
    'Free consultation for study abroad programs',
    'https://example.com/consultation.jpg',
    'https://studyatsac.com/consultation',
    '2025-01-01 00:00:00',
    NULL,
    5,
    1,
    1
);

-- Example 3: Future popup (not yet active)
INSERT INTO `popups` (
    `uuid`, 
    `title`, 
    `description`, 
    `image_url`, 
    `link_url`, 
    `start_date`, 
    `end_date`, 
    `priority`, 
    `status`, 
    `created_by`
) VALUES (
    UUID(),
    'New Year Special Offer',
    'Special discount for new year',
    'https://example.com/newyear.jpg',
    'https://studyatsac.com/promo',
    '2026-01-01 00:00:00',
    '2026-01-31 23:59:59',
    20,
    1,
    1
);

-- Example 4: Inactive popup
INSERT INTO `popups` (
    `uuid`, 
    `title`, 
    `description`, 
    `image_url`, 
    `link_url`, 
    `start_date`, 
    `end_date`, 
    `priority`, 
    `status`, 
    `created_by`
) VALUES (
    UUID(),
    'Expired Promotion',
    'This popup is inactive',
    'https://example.com/expired.jpg',
    'https://studyatsac.com/old',
    '2024-01-01 00:00:00',
    '2024-12-31 23:59:59',
    15,
    0,
    1
);

-- Test Query: Get active popup (should return "IELTS with Experts Program" with priority 10)
SELECT * 
FROM `popups` 
WHERE `status` = 1
  AND (`start_date` IS NULL OR `start_date` <= NOW())
  AND (`end_date` IS NULL OR `end_date` >= NOW())
  AND `deleted_at` IS NULL
ORDER BY `priority` DESC, `created_at` DESC
LIMIT 1;
