CREATE TABLE Events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  google_event_id VARCHAR(255),

  -- ✅ future integration field (OCR module)
  ocr_text_id INT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
