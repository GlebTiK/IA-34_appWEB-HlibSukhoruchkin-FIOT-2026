CREATE TABLE IF NOT EXISTS puppies (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  age_months INT NOT NULL,
  price_uah DECIMAL(10,2) NOT NULL,
  photo_url VARCHAR(1024) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS visit_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  puppy_id BIGINT UNSIGNED NOT NULL,
  visitor_name VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  visit_datetime DATETIME NOT NULL,
  note TEXT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_visit_requests_puppy_id (puppy_id),
  CONSTRAINT fk_visit_requests_puppy
    FOREIGN KEY (puppy_id) REFERENCES puppies(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
