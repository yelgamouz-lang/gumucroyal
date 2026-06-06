-- GUMÜÇ ROYAL — corriger base_price_mad (PostgreSQL)
-- Exécuter une fois si la base contient encore les anciens prix.

UPDATE products SET base_price_mad = 129, compare_at_price_mad = 129 WHERE slug = 'bague-lien-eternel';
UPDATE products SET base_price_mad = 149, compare_at_price_mad = 149 WHERE slug = 'collier-trefle-lumiere';
UPDATE products SET base_price_mad = 129, compare_at_price_mad = 129 WHERE slug = 'bague-double-signature';

-- Recalculer les paliers offres (1 / 2 / 3 pièces)
UPDATE offers SET price_mad = 129, compare_at_price_mad = NULL, savings_mad = NULL
  WHERE slug = 'GR-BLE-001-single';
UPDATE offers SET price_mad = 210, compare_at_price_mad = NULL, savings_mad = NULL
  WHERE slug = 'GR-BLE-001-duo';
UPDATE offers SET price_mad = 280, compare_at_price_mad = NULL, savings_mad = NULL
  WHERE slug = 'GR-BLE-001-trio';

UPDATE offers SET price_mad = 149, compare_at_price_mad = NULL, savings_mad = NULL
  WHERE slug = 'GR-CTL-002-single';
UPDATE offers SET price_mad = 240, compare_at_price_mad = NULL, savings_mad = NULL
  WHERE slug = 'GR-CTL-002-duo';
UPDATE offers SET price_mad = 330, compare_at_price_mad = NULL, savings_mad = NULL
  WHERE slug = 'GR-CTL-002-trio';

UPDATE offers SET price_mad = 129, compare_at_price_mad = NULL, savings_mad = NULL
  WHERE slug = 'GR-BDS-003-single';
UPDATE offers SET price_mad = 210, compare_at_price_mad = NULL, savings_mad = NULL
  WHERE slug = 'GR-BDS-003-duo';
UPDATE offers SET price_mad = 280, compare_at_price_mad = NULL, savings_mad = NULL
  WHERE slug = 'GR-BDS-003-trio';
