CREATE TABLE workshops (
    id VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    title VARCHAR(160) NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE admin_users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(255) CHARACTER SET ascii NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY admin_users_email_unique (email)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE admin_sessions (
    token_hash BINARY(32) NOT NULL,
    admin_user_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    PRIMARY KEY (token_hash),
    KEY admin_sessions_admin_index (admin_user_id),
    KEY admin_sessions_expiry_index (expires_at),
    CONSTRAINT admin_sessions_admin_fk FOREIGN KEY (admin_user_id)
        REFERENCES admin_users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE booking_requests (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_code CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    request_key CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    workshop_id VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    preferred_date DATE NOT NULL,
    seat_count INT UNSIGNED NOT NULL,
    notes VARCHAR(500) NULL,
    status ENUM('pending', 'contacted', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
    contacted_at TIMESTAMP NULL DEFAULT NULL,
    confirmed_start_at DATETIME NULL,
    confirmed_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY booking_requests_public_code_unique (public_code),
    UNIQUE KEY booking_requests_request_key_unique (request_key),
    KEY booking_requests_status_date_index (status, preferred_date, id),
    KEY booking_requests_confirmed_start_index (confirmed_start_at),
    CONSTRAINT booking_requests_workshop_fk FOREIGN KEY (workshop_id) REFERENCES workshops (id),
    CONSTRAINT booking_requests_confirmed_by_fk FOREIGN KEY (confirmed_by) REFERENCES admin_users (id),
    CONSTRAINT booking_requests_positive_seats CHECK (seat_count > 0),
    CONSTRAINT booking_requests_confirmed_details CHECK (
        status <> 'confirmed' OR (confirmed_start_at IS NOT NULL AND confirmed_by IS NOT NULL)
    )
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE email_outbox (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    booking_request_id BIGINT UNSIGNED NOT NULL,
    recipient_email VARCHAR(254) NOT NULL,
    status ENUM('pending', 'processing', 'sent', 'failed') NOT NULL DEFAULT 'pending',
    attempts INT UNSIGNED NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    claim_token BINARY(16) NULL,
    lease_expires_at TIMESTAMP NULL DEFAULT NULL,
    sent_at TIMESTAMP NULL DEFAULT NULL,
    last_error VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY email_outbox_booking_request_unique (booking_request_id),
    KEY email_outbox_ready_index (status, next_attempt_at, id),
    KEY email_outbox_lease_index (status, lease_expires_at),
    CONSTRAINT email_outbox_booking_request_fk FOREIGN KEY (booking_request_id)
        REFERENCES booking_requests (id),
    CONSTRAINT email_outbox_sent_timestamp CHECK (status <> 'sent' OR sent_at IS NOT NULL),
    CONSTRAINT email_outbox_processing_lease CHECK (
        status <> 'processing' OR (claim_token IS NOT NULL AND lease_expires_at IS NOT NULL)
    )
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
