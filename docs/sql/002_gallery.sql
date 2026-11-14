CREATE TABLE gallery_upload_links (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    booking_request_id BIGINT UNSIGNED NOT NULL,
    token_hash BINARY(32) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY gallery_upload_links_token_unique (token_hash),
    KEY gallery_upload_links_booking_index (booking_request_id),
    CONSTRAINT gallery_upload_links_booking_fk FOREIGN KEY (booking_request_id)
        REFERENCES booking_requests (id)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE gallery (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    upload_link_id BIGINT UNSIGNED NULL,
    storage_key VARCHAR(255) COLLATE utf8mb4_bin NOT NULL,
    thumbnail_key VARCHAR(255) COLLATE utf8mb4_bin NULL,
    title VARCHAR(160) NOT NULL,
    alt_text VARCHAR(250) NOT NULL,
    caption TEXT NULL,
    width_px INT UNSIGNED NOT NULL,
    height_px INT UNSIGNED NOT NULL,
    status ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    -- NULL keeps a published image in the archive without featuring it in the book.
    featured_order TINYINT UNSIGNED NULL,
    consent_at TIMESTAMP NULL DEFAULT NULL,
    reviewed_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY gallery_storage_key_unique (storage_key),
    UNIQUE KEY gallery_featured_order_unique (featured_order),
    KEY gallery_archive_index (status, published_at DESC, id DESC),
    CONSTRAINT gallery_upload_link_fk FOREIGN KEY (upload_link_id) REFERENCES gallery_upload_links (id),
    CONSTRAINT gallery_reviewed_by_fk FOREIGN KEY (reviewed_by) REFERENCES admin_users (id),
    CONSTRAINT gallery_dimensions_positive CHECK (width_px > 0 AND height_px > 0),
    CONSTRAINT gallery_featured_position CHECK (
        featured_order IS NULL OR (status = 'published' AND featured_order BETWEEN 1 AND 5)
    ),
    CONSTRAINT gallery_published_details CHECK (
        status <> 'published' OR (
            published_at IS NOT NULL AND reviewed_by IS NOT NULL
            AND (upload_link_id IS NULL OR consent_at IS NOT NULL)
        )
    )
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
