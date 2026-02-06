-- Seed initial site settings for footer configuration
-- Run this after migration to set up default values

-- First, delete existing settings to update with new format
DELETE FROM site_settings WHERE key IN ('footer_social_links', 'footer_contact_email');

INSERT INTO site_settings (id, key, value, created_at, updated_at)
VALUES
  (
    gen_random_uuid(),
    'footer_social_links',
    '{
      "links": [
        { "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg", "name": "Facebook", "url": "https://facebook.com", "enabled": true },
        { "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/x.svg", "name": "Twitter/X", "url": "https://twitter.com", "enabled": true },
        { "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg", "name": "Instagram", "url": "https://instagram.com", "enabled": true },
        { "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtube.svg", "name": "YouTube", "url": "https://youtube.com", "enabled": true },
        { "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg", "name": "GitHub", "url": "https://github.com", "enabled": true }
      ]
    }',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'footer_contact_email',
    '{ "email": "contact@example.com" }',
    NOW(),
    NOW()
  );
