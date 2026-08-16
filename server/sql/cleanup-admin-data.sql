-- 清理xuxiake(u1)管理员账号的所有用户内容
DELETE FROM comments WHERE author_id='u1';
DELETE FROM likes WHERE user_id='u1';
DELETE FROM reports WHERE reporter_id='u1';
DELETE FROM collection_posts WHERE collection_id IN (SELECT id FROM collections WHERE creator_id='u1');
DELETE FROM collections WHERE creator_id='u1';
DELETE FROM user_follows WHERE follower_id='u1' OR following_id='u1';
DELETE FROM notifications WHERE recipient_id='u1';
DELETE FROM messages WHERE sender_id='u1';
DELETE FROM conversation_participants WHERE user_id='u1';
DELETE FROM community_roles WHERE user_id='u1';
DELETE FROM user_interests WHERE user_id='u1';
DELETE FROM journey_stop_media WHERE stop_id IN (SELECT id FROM journey_stops WHERE journey_id IN (SELECT id FROM journeys WHERE post_id IN (SELECT id FROM posts WHERE author_id='u1')));
DELETE FROM journey_stops WHERE journey_id IN (SELECT id FROM journeys WHERE post_id IN (SELECT id FROM posts WHERE author_id='u1'));
DELETE FROM journeys WHERE post_id IN (SELECT id FROM posts WHERE author_id='u1');
DELETE FROM recommendation_feedback WHERE user_id='u1';
DELETE FROM posts WHERE author_id='u1';

SELECT 'xuxiake cleanup done' AS result;
