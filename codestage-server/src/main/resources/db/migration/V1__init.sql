CREATE TABLE assessments
(
    id              SERIAL PRIMARY KEY,
    completed       BOOLEAN default false,
    candidate_name  VARCHAR(255) not null,
    candidate_email VARCHAR(255) not null,
    invite_notes    TEXT,
    admin_id        varchar(255) not null,

    /* Only when completed*/
    code            TEXT,
    notes           TEXT,

    created_at      TIMESTAMP
);

CREATE TABLE workspace_events
(
    id            SERIAL PRIMARY KEY,
    assessment_id INTEGER REFERENCES assessments (id),
    event_type    TEXT not null,
    details       TEXT,
    created_at    TIMESTAMP
);