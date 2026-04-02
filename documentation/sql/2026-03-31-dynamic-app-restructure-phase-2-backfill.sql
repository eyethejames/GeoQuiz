BEGIN;

INSERT INTO region (name, parent_region_id, type) VALUES 
    ('World', NULL, 'world')
ON CONFLICT (name) DO NOTHING;

INSERT INTO region (name, parent_region_id, type) VALUES 
    ('Europe', (SELECT region_id FROM region WHERE name = 'World'), 'continent'),
    ('Africa', (SELECT region_id FROM region WHERE name = 'World'), 'continent'),
    ('Asia', (SELECT region_id FROM region WHERE name = 'World'), 'continent'),
    ('America', (SELECT region_id FROM region WHERE name = 'World'), 'continent'),
    ('Oceania', (SELECT region_id FROM region WHERE name = 'World'), 'continent')
ON CONFLICT (name) DO NOTHING;

INSERT INTO region (name, parent_region_id, type) VALUES
    ('North America', (SELECT region_id FROM region WHERE name = 'America'), 'subcontinent'),
    ('Central America', (SELECT region_id FROM region WHERE name = 'America'), 'subcontinent'),
    ('South America', (SELECT region_id FROM region WHERE name = 'America'), 'subcontinent')
ON CONFLICT (name) DO NOTHING;

UPDATE category
SET name = 'Nature and Landforms' WHERE name = 'Europe';

INSERT INTO category (name) VALUES
    ('Countries'), ('Cities'),('Capitals'), ('Flags'), ('Landmarks'), ('Nature and Landforms'),
    ('Historic events'), ('Culture'), ('Economy'), ('Politics')
ON CONFLICT (name) DO NOTHING;

UPDATE question
SET region_id = (SELECT region_id FROM region WHERE name = 'Europe')
WHERE region_id IS NULL;

UPDATE question
SET category_id = (SELECT category_id FROM category WHERE name = 'Nature and Landforms') 
WHERE question_id in (1, 2, 3);

INSERT INTO session_category (session_id, category_id)
SELECT gs.session_id, q.category_id
FROM game_session gs JOIN quiz q ON gs.quiz_id = q.quiz_id
ON CONFLICT DO NOTHING;

UPDATE game_session
SET region_id = (SELECT region_id FROM region WHERE name = 'Europe') 
WHERE region_id IS NULL;

UPDATE game_session gs
SET question_count = (SELECT COUNT(*) FROM quiz_question qq WHERE qq.quiz_id = gs.quiz_id)
WHERE question_count IS NULL;

COMMIT;