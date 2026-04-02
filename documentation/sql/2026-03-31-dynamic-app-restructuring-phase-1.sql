BEGIN;

CREATE TABLE if not EXISTS region (
    region_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(255) NOT NULL UNIQUE,
    parent_region_id integer,
    type varchar(30),
    CONSTRAINT region_parent_region_fk 
        FOREIGN KEY (parent_region_id) REFERENCES region(region_id)
);

ALTER TABLE question 
    ADD COLUMN IF NOT EXISTS region_id integer,
    DROP COLUMN IF EXISTS difficulty_id,
    ADD COLUMN IF NOT EXISTS difficulty integer;

ALTER TABLE question
    ADD CONSTRAINT question_region_fk
        FOREIGN KEY (region_id) REFERENCES region(region_id);

ALTER TABLE game_session
    ADD COLUMN IF NOT EXISTS region_id integer,
    ADD COLUMN IF NOT EXISTS question_count integer;

ALTER TABLE game_session
    ADD CONSTRAINT game_session_region_fk
        FOREIGN KEY (region_id) REFERENCES region(region_id);

CREATE TABLE IF NOT EXISTS session_category (
    session_id integer NOT NULL,
    category_id integer NOT NULL,
    PRIMARY KEY (session_id, category_id),
    FOREIGN KEY (session_id) REFERENCES game_session(session_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category(category_id)
);

CREATE TABLE IF NOT EXISTS session_question (
    session_id integer NOT NULL,
    question_id integer NOT NULL,
    position integer NOT NULL,
    PRIMARY KEY (session_id, question_id),
    CONSTRAINT session_question_session_fk
        FOREIGN KEY (session_id) REFERENCES game_session(session_id) ON DELETE CASCADE,
    CONSTRAINT session_question_question_fk
        FOREIGN KEY (question_id) REFERENCES question(question_id) ON DELETE CASCADE,
    CONSTRAINT session_question_position_unique UNIQUE (session_id, position)
);

CREATE UNIQUE INDEX IF NOT EXISTS answer_option_question_option_unique 
    ON answer_option (question_id, option_id);

COMMIT;