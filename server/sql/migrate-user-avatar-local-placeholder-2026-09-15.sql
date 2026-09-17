-- New registrations now use the local /api/placeholder default avatar.
-- This migration converts historical DiceBear avatar URLs to local placeholders
-- so offline demos and restored environments do not depend on an external avatar service.

UPDATE users
SET avatar_url = CONCAT('/api/placeholder/', username)
WHERE avatar_url LIKE 'https://api.dicebear.com/%';

-- Verification query: should return 0.
SELECT COUNT(*) AS dicebear_user_avatar_count
FROM users
WHERE avatar_url LIKE 'https://api.dicebear.com/%';
