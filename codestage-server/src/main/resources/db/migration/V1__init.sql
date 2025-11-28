CREATE TYPE assessment_status AS ENUM ('created', 'completed');

CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    status assessment_status,
    candidate_name VARCHAR(255),
    candidate_email VARCHAR(255),
    created_at TIMESTAMP
);