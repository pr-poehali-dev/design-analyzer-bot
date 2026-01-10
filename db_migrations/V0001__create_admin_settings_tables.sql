CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS layout_blocks (
  id SERIAL PRIMARY KEY,
  block_id VARCHAR(50) UNIQUE NOT NULL,
  block_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_settings (setting_key, setting_value) VALUES 
  ('primary_color', '"#9333ea"'),
  ('secondary_color', '"#ec4899"'),
  ('background_color', '"#ffffff"'),
  ('site_title', '"Paletteek"'),
  ('site_description', '"Точный анализ цветов и поиск шрифтов на изображениях"')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO layout_blocks (block_id, block_type, title, position_x, position_y, width, height, visible) VALUES
  ('1', 'header', 'Шапка сайта', 0, 0, 100, 20, true),
  ('2', 'upload', 'Загрузка изображения', 0, 20, 50, 60, true),
  ('3', 'results', 'Результаты анализа', 50, 20, 50, 60, true),
  ('4', 'history', 'История', 0, 80, 100, 20, true)
ON CONFLICT (block_id) DO NOTHING;