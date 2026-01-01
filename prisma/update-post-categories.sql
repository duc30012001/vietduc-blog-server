-- ============================================
-- Randomly assign categories to posts
-- Run this in DBeaver
-- ============================================

UPDATE posts 
SET category_id = (ARRAY[
    'd62f99ee-3f9a-49c1-bf61-b9d5df81c5bf',
    '7315d3db-9941-48ca-9ac1-fb8cc7be96f7',
    '98e2886c-b2a9-40b0-911b-26df5393a1a3',
    '4e32874e-833c-49e1-bd57-f7ecd6b434ef',
    '2a133f0c-ddd4-4106-83bb-0ba60048a103',
    'd60837f0-86c4-436f-b457-1dd201552157',
    '62189826-f3af-41b2-8022-19fb0f60fdce'
]::uuid[])[floor(random() * 7 + 1)::int]
WHERE category_id is null

-- Verify distribution
SELECT category_id, COUNT(*) 
FROM posts 
WHERE creator_id = '2128c3e1-1a6e-4281-b2c2-24602428f50d'
GROUP BY category_id;
