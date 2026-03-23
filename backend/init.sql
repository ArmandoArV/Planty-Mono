-- ============================================================
-- Planty — PostgreSQL Database Setup
-- Run once:  psql -U postgres -f init.sql
-- ============================================================

-- 1. Create database (ignore error if it already exists)
-- You can also run:  createdb planty
SELECT 'CREATE DATABASE planty'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'planty')\gexec

\connect planty;

-- 2. Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

-- Roles (normalized lookup table)
CREATE TABLE IF NOT EXISTS roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description VARCHAR(60) NOT NULL UNIQUE
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(120)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash CHAR(64)      NOT NULL,                       -- SHA-256 hex digest
    role_id       UUID          NOT NULL REFERENCES roles(id),
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ                                    -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_users_email      ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role_id    ON users (role_id);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users (deleted_at);

-- Plants
CREATE TABLE IF NOT EXISTS plants (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID          NOT NULL REFERENCES users(id),
    name        VARCHAR(120)  NOT NULL,
    species     VARCHAR(120),
    pump_status BOOLEAN       NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ                                      -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_plants_user_id    ON plants (user_id);
CREATE INDEX IF NOT EXISTS idx_plants_deleted_at ON plants (deleted_at);

-- Sensor Readings
CREATE TABLE IF NOT EXISTS sensor_readings (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id   UUID          NOT NULL REFERENCES plants(id),
    moisture   DOUBLE PRECISION NOT NULL,                        -- 0-100 %
    pump_on    BOOLEAN       NOT NULL DEFAULT false,
    plant_mood VARCHAR(10),                                      -- happy | normal | sad
    created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_plant_id   ON sensor_readings (plant_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_created_at ON sensor_readings (created_at DESC);

-- Device Keys (static API keys for Arduino devices)
CREATE TABLE IF NOT EXISTS device_keys (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id  UUID         NOT NULL REFERENCES users(id),
    plant_id UUID         NOT NULL REFERENCES plants(id),
    key      CHAR(64)     NOT NULL UNIQUE,                      -- crypto-random hex
    label    VARCHAR(120),                                      -- e.g. "Living Room Arduino"
    active   BOOLEAN      NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_device_keys_key      ON device_keys (key) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_device_keys_user_id  ON device_keys (user_id);
CREATE INDEX IF NOT EXISTS idx_device_keys_plant_id ON device_keys (plant_id);

-- ============================================================
-- SEED DEFAULT ROLES
-- ============================================================
INSERT INTO roles (description) VALUES
    ('admin'),
    ('user'),
    ('viewer')
ON CONFLICT (description) DO NOTHING;

-- ============================================================
-- STORED PROCEDURES & FUNCTIONS
-- ============================================================

-- -----------------------------------------------------------
-- sp_register_user
-- Registers a new user with a SHA-256 pre-hashed password.
-- Returns the created user row.
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_register_user(
    p_name          VARCHAR,
    p_email         VARCHAR,
    p_password_hash CHAR(64),
    p_role_desc     VARCHAR DEFAULT 'user'
)
RETURNS TABLE (
    id        UUID,
    name      VARCHAR,
    email     VARCHAR,
    role_id   UUID,
    role_desc VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_role_id UUID;
    v_user_id UUID;
BEGIN
    -- Resolve role
    SELECT r.id INTO v_role_id
    FROM roles r WHERE r.description = p_role_desc;

    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'Role "%" does not exist', p_role_desc;
    END IF;

    -- Check duplicate email
    IF EXISTS (SELECT 1 FROM users u WHERE u.email = p_email AND u.deleted_at IS NULL) THEN
        RAISE EXCEPTION 'Email "%" is already registered', p_email;
    END IF;

    -- Insert
    INSERT INTO users (name, email, password_hash, role_id)
    VALUES (p_name, p_email, p_password_hash, v_role_id)
    RETURNING users.id INTO v_user_id;

    RETURN QUERY
        SELECT u.id, u.name, u.email, u.role_id, r.description
        FROM users u
        JOIN roles r ON r.id = u.role_id
        WHERE u.id = v_user_id;
END;
$$;

-- -----------------------------------------------------------
-- sp_authenticate_user
-- Validates credentials and returns the user + role.
-- Returns empty set on failure (no exception).
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_authenticate_user(
    p_email         VARCHAR,
    p_password_hash CHAR(64)
)
RETURNS TABLE (
    id        UUID,
    name      VARCHAR,
    email     VARCHAR,
    role_id   UUID,
    role_desc VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
        SELECT u.id, u.name, u.email, u.role_id, r.description
        FROM users u
        JOIN roles r ON r.id = u.role_id
        WHERE u.email = p_email
          AND u.password_hash = p_password_hash
          AND u.deleted_at IS NULL;
END;
$$;

-- -----------------------------------------------------------
-- sp_create_plant
-- Creates a plant for a given user. Returns the new row.
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_create_plant(
    p_user_id UUID,
    p_name    VARCHAR,
    p_species VARCHAR DEFAULT NULL
)
RETURNS SETOF plants
LANGUAGE plpgsql
AS $$
DECLARE
    v_plant_id UUID;
BEGIN
    -- Verify user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND deleted_at IS NULL) THEN
        RAISE EXCEPTION 'User % not found', p_user_id;
    END IF;

    INSERT INTO plants (user_id, name, species)
    VALUES (p_user_id, p_name, p_species)
    RETURNING plants.id INTO v_plant_id;

    RETURN QUERY SELECT * FROM plants WHERE id = v_plant_id;
END;
$$;

-- -----------------------------------------------------------
-- sp_toggle_pump
-- Flips pump_status for a plant owned by the user.
-- Returns the updated plant row.
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_toggle_pump(
    p_user_id  UUID,
    p_plant_id UUID
)
RETURNS SETOF plants
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE plants
    SET pump_status = NOT pump_status,
        updated_at  = now()
    WHERE id      = p_plant_id
      AND user_id = p_user_id
      AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Plant % not found for user %', p_plant_id, p_user_id;
    END IF;

    RETURN QUERY SELECT * FROM plants WHERE id = p_plant_id;
END;
$$;

-- -----------------------------------------------------------
-- sp_insert_reading
-- Stores a sensor data point and auto-derives plant_mood
-- if not provided (based on Arduino thresholds).
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_insert_reading(
    p_plant_id   UUID,
    p_moisture   DOUBLE PRECISION,
    p_pump_on    BOOLEAN DEFAULT false,
    p_plant_mood VARCHAR DEFAULT NULL
)
RETURNS SETOF sensor_readings
LANGUAGE plpgsql
AS $$
DECLARE
    v_mood       VARCHAR(10);
    v_reading_id UUID;
BEGIN
    -- Auto-derive mood from moisture thresholds (matches Arduino main.ino)
    IF p_plant_mood IS NOT NULL THEN
        v_mood := p_plant_mood;
    ELSIF p_moisture >= 66.66 THEN
        v_mood := 'happy';
    ELSIF p_moisture >= 33.33 THEN
        v_mood := 'normal';
    ELSE
        v_mood := 'sad';
    END IF;

    INSERT INTO sensor_readings (plant_id, moisture, pump_on, plant_mood)
    VALUES (p_plant_id, p_moisture, p_pump_on, v_mood)
    RETURNING sensor_readings.id INTO v_reading_id;

    RETURN QUERY SELECT * FROM sensor_readings WHERE id = v_reading_id;
END;
$$;

-- -----------------------------------------------------------
-- sp_get_plant_dashboard
-- Returns a single-row summary for the dashboard card:
-- latest moisture, pump status, mood, reading count, averages.
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_get_plant_dashboard(
    p_user_id  UUID,
    p_plant_id UUID
)
RETURNS TABLE (
    plant_id       UUID,
    plant_name     VARCHAR,
    species        VARCHAR,
    pump_status    BOOLEAN,
    latest_moisture DOUBLE PRECISION,
    latest_mood    VARCHAR,
    avg_moisture   DOUBLE PRECISION,
    reading_count  BIGINT,
    last_reading_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
        SELECT
            p.id,
            p.name,
            p.species,
            p.pump_status,
            lr.moisture,
            lr.plant_mood,
            COALESCE(stats.avg_m, 0),
            COALESCE(stats.cnt, 0),
            lr.created_at
        FROM plants p
        LEFT JOIN LATERAL (
            SELECT sr.moisture, sr.plant_mood, sr.created_at
            FROM sensor_readings sr
            WHERE sr.plant_id = p.id
            ORDER BY sr.created_at DESC
            LIMIT 1
        ) lr ON true
        LEFT JOIN LATERAL (
            SELECT AVG(sr2.moisture) AS avg_m, COUNT(*) AS cnt
            FROM sensor_readings sr2
            WHERE sr2.plant_id = p.id
        ) stats ON true
        WHERE p.id      = p_plant_id
          AND p.user_id = p_user_id
          AND p.deleted_at IS NULL;
END;
$$;

-- -----------------------------------------------------------
-- sp_assign_role
-- Admin operation: changes a user's role.
-- -----------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_assign_role(
    p_target_user_id UUID,
    p_new_role_id    UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM roles WHERE id = p_new_role_id) THEN
        RAISE EXCEPTION 'Role % does not exist', p_new_role_id;
    END IF;

    UPDATE users
    SET role_id    = p_new_role_id,
        updated_at = now()
    WHERE id = p_target_user_id
      AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User % not found', p_target_user_id;
    END IF;

    COMMIT;
END;
$$;

-- -----------------------------------------------------------
-- sp_soft_delete_plant
-- Soft-deletes a plant and all its readings.
-- -----------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_soft_delete_plant(
    p_user_id  UUID,
    p_plant_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE plants
    SET deleted_at = now(),
        updated_at = now()
    WHERE id      = p_plant_id
      AND user_id = p_user_id
      AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Plant % not found for user %', p_plant_id, p_user_id;
    END IF;

    COMMIT;
END;
$$;

-- ============================================================
-- VERIFY
-- ============================================================
\echo '✅ Database "planty" created successfully.'
\echo ''
\echo 'Tables:'
\dt
\echo ''
\echo 'Functions & Procedures:'
\df sp_*
