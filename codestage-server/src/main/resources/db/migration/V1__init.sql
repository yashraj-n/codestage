CREATE TABLE assessments
(
    id              SERIAL PRIMARY KEY,
    completed       BOOLEAN,
    candidate_name  VARCHAR(255),
    candidate_email VARCHAR(255),
    invite_notes    TEXT,
    admin_id        varchar(255),
    created_at      TIMESTAMP
);

CREATE TABLE code_changes
(
    id            SERIAL PRIMARY KEY,
    assessment_id INTEGER REFERENCES assessments (id),
    code          TEXT,
    created_at    TIMESTAMP
);