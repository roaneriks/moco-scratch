-- ─────────────────────────────────────────────────────────────────────────────
-- Moco Scratch — Seed data
-- All 15 artworks + 8 artists from the current pick grid (index.html)
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. Artists ───────────────────────────────────────────────────────────────

insert into artists (id, name, birthplace, born_year, died_year, portrait_url) values
  ('a1000000-0000-0000-0000-000000000001', 'Banksy',            'Bristol, United Kingdom',  1974, null, ''),
  ('a1000000-0000-0000-0000-000000000002', 'Keith Haring',      'Reading, Pennsylvania, US', 1958, 1990, ''),
  ('a1000000-0000-0000-0000-000000000003', 'Jean-Michel Basquiat', 'Brooklyn, New York, US', 1960, 1988, ''),
  ('a1000000-0000-0000-0000-000000000004', 'Jeff Koons',        'York, Pennsylvania, US',   1955, null, ''),
  ('a1000000-0000-0000-0000-000000000005', 'Damien Hirst',      'Bristol, United Kingdom',  1965, null, ''),
  ('a1000000-0000-0000-0000-000000000006', 'Robin Kid',         null,                       1988, null, ''),
  ('a1000000-0000-0000-0000-000000000007', 'Guillermo Lorca',   'Santiago, Chile',          1984, null, ''),
  ('a1000000-0000-0000-0000-000000000008', 'Loreamus Falsus',   null,                       1990, null, '');


-- ── 2. Artworks ──────────────────────────────────────────────────────────────
-- grid_position matches current order in the 3×5 picker grid (1–15)

insert into artworks (id, title, year, artist_id, description, technique, grid_position) values

  -- 1. Banksy — Love is in the Air
  ('b1000000-0000-0000-0000-000000000001',
   'Love is in the Air', '2003',
   'a1000000-0000-0000-0000-000000000001',
   'Banksy converts an act of protest into a still life. The bouquet refuses the script: protest as bloom, not blast.',
   'stencil', 1),

  -- 2. Keith Haring — USA 1982
  ('b1000000-0000-0000-0000-000000000002',
   'USA 1982', '1982',
   'a1000000-0000-0000-0000-000000000002',
   'Crayon-scratched icons against a graffiti backdrop — fear translated into a kid''s drawing of the apocalypse.',
   'bold outline', 2),

  -- 3. Basquiat — Flash in Naples
  ('b1000000-0000-0000-0000-000000000003',
   'Flash in Naples', '1983',
   'a1000000-0000-0000-0000-000000000003',
   'Basquiat rewires pop-culture icons with layered text and raw paint, turning Batman and The Flash into vessels for Black history and power.',
   'neo-expressionist', 3),

  -- 4. Jeff Koons — Balloon Venus
  ('b1000000-0000-0000-0000-000000000004',
   'Balloon Venus', '2014',
   'a1000000-0000-0000-0000-000000000004',
   'Koons collapses 35,000 years of human desire into a single glossy surface that reflects you back at yourself.',
   'fabricated steel', 4),

  -- 5. Damien Hirst — Politeness
  ('b1000000-0000-0000-0000-000000000005',
   'Politeness', '2021',
   'a1000000-0000-0000-0000-000000000005',
   'Hirst''s Cherry Blossom paintings ask whether beauty can be made by repetition alone — and whether it matters that a human hand placed every mark.',
   'hand-applied dots', 5),

  -- 6. Banksy — Choose Your Weapon
  ('b1000000-0000-0000-0000-000000000006',
   'Choose Your Weapon', '2010',
   'a1000000-0000-0000-0000-000000000001',
   'Banksy borrows Haring''s barking dog symbol and puts it on a chain, turning an act of artistic homage into a commentary on ownership and legacy.',
   'screen printing', 6),

  -- 7. Banksy — Happy Choppers
  ('b1000000-0000-0000-0000-000000000007',
   'Happy Choppers', '2002',
   'a1000000-0000-0000-0000-000000000001',
   'Banksy decorates instruments of war with the language of gift-giving, making the absurdity of military spending impossible to ignore.',
   'screen printing', 7),

  -- 8. Banksy — Grin Reaper
  ('b1000000-0000-0000-0000-000000000008',
   'Grin Reaper', '2001',
   'a1000000-0000-0000-0000-000000000001',
   'The Grim Reaper''s skull replaced by a smiley face: Banksy''s most succinct commentary on the cheerfulness we perform in the face of mortality.',
   'stencil', 8),

  -- 9. Banksy — Hard Hat Tortoise
  ('b1000000-0000-0000-0000-000000000009',
   'Hard Hat Tortoise', '2006',
   'a1000000-0000-0000-0000-000000000001',
   'Banksy grafts construction safety onto nature, giving the tortoise a hard hat shell. Urban survival as evolutionary adaptation.',
   'stencil', 9),

  -- 10. Banksy — Our Lady
  ('b1000000-0000-0000-0000-000000000010',
   'Our Lady', '2003',
   'a1000000-0000-0000-0000-000000000001',
   'Banksy places Old Master religious iconography on industrial metal, questioning where the sacred belongs in a modern city.',
   'stencil', 10),

  -- 11. Keith Haring — Untitled (Man and Dog)
  ('b1000000-0000-0000-0000-000000000011',
   'Untitled (Man and Dog)', '1982',
   'a1000000-0000-0000-0000-000000000002',
   'Two bodies — one human, one animal — outlined in Haring''s signature thick white line on black. Joyful, urgent, universal.',
   'bold outline', 11),

  -- 12. Robin Kid — The Future is Old
  ('b1000000-0000-0000-0000-000000000012',
   'The Future is Old', '2022',
   'a1000000-0000-0000-0000-000000000006',
   'Robin Kid''s hyper-detailed paintings place contemporary youth in symbolic tableaux. Here, the future sits tired on the flag that promised it everything.',
   'hyperrealism', 12),

  -- 13. Guillermo Lorca — El Festín
  ('b1000000-0000-0000-0000-000000000013',
   'El Festín', '2019',
   'a1000000-0000-0000-0000-000000000007',
   'Lorca''s hyperrealistic canvases blur the line between fairy tale and nightmare. Animals crowd a woman in Victorian dress inside an ornate gilded room.',
   'hyperrealism', 13),

  -- 14. Guillermo Lorca — El Jardín
  ('b1000000-0000-0000-0000-000000000014',
   'El Jardín', '2018',
   'a1000000-0000-0000-0000-000000000007',
   'Lorca''s signature mix of childhood wonder and menace: a fantastical garden where beauty and danger are interchangeable.',
   'hyperrealism', 14),

  -- 15. Loreamus Falsus — I Like People
  ('b1000000-0000-0000-0000-000000000015',
   'I Like People', '2024',
   'a1000000-0000-0000-0000-000000000008',
   'Hundreds of simplified figures fill the canvas. A speech bubble floats above: ''I Like People But They Make Me Very, Very Tired.''',
   'crowd composition', 15);


-- ── 3. Materials ─────────────────────────────────────────────────────────────

insert into artwork_materials (artwork_id, label, icon_name) values
  -- Love is in the Air
  ('b1000000-0000-0000-0000-000000000001', 'spray',   'spray'),
  ('b1000000-0000-0000-0000-000000000001', 'stencil', 'stencil'),
  ('b1000000-0000-0000-0000-000000000001', 'wall',    'wall'),
  ('b1000000-0000-0000-0000-000000000001', 'flowers', 'flowers'),
  -- USA 1982
  ('b1000000-0000-0000-0000-000000000002', 'acrylic',     'acrylic'),
  ('b1000000-0000-0000-0000-000000000002', 'canvas tarp', 'canvas'),
  ('b1000000-0000-0000-0000-000000000002', 'marker',      'marker'),
  -- Flash in Naples
  ('b1000000-0000-0000-0000-000000000003', 'acrylic',  'acrylic'),
  ('b1000000-0000-0000-0000-000000000003', 'oilstick', 'oilstick'),
  ('b1000000-0000-0000-0000-000000000003', 'canvas',   'canvas'),
  ('b1000000-0000-0000-0000-000000000003', 'collage',  'collage'),
  -- Balloon Venus
  ('b1000000-0000-0000-0000-000000000004', 'polished steel', 'polished_steel'),
  ('b1000000-0000-0000-0000-000000000004', 'mirror finish',  'mirror_finish'),
  ('b1000000-0000-0000-0000-000000000004', 'chrome',         'chrome'),
  -- Politeness
  ('b1000000-0000-0000-0000-000000000005', 'oil paint',  'oil_paint'),
  ('b1000000-0000-0000-0000-000000000005', 'canvas',     'canvas'),
  ('b1000000-0000-0000-0000-000000000005', 'brush dots', 'brush_dots'),
  -- Choose Your Weapon
  ('b1000000-0000-0000-0000-000000000006', 'screenprint', 'screenprint'),
  ('b1000000-0000-0000-0000-000000000006', 'paper',       'paper'),
  ('b1000000-0000-0000-0000-000000000006', 'ink',         'ink'),
  -- Happy Choppers
  ('b1000000-0000-0000-0000-000000000007', 'screenprint', 'screenprint'),
  ('b1000000-0000-0000-0000-000000000007', 'paper',       'paper'),
  -- Grin Reaper
  ('b1000000-0000-0000-0000-000000000008', 'spray paint', 'spray'),
  ('b1000000-0000-0000-0000-000000000008', 'stencil',     'stencil'),
  ('b1000000-0000-0000-0000-000000000008', 'canvas',      'canvas'),
  -- Hard Hat Tortoise
  ('b1000000-0000-0000-0000-000000000009', 'spray paint', 'spray'),
  ('b1000000-0000-0000-0000-000000000009', 'stencil',     'stencil'),
  ('b1000000-0000-0000-0000-000000000009', 'wall',        'wall'),
  -- Our Lady
  ('b1000000-0000-0000-0000-000000000010', 'spray paint', 'spray'),
  ('b1000000-0000-0000-0000-000000000010', 'stencil',     'stencil'),
  ('b1000000-0000-0000-0000-000000000010', 'metal',       'metal'),
  -- Untitled (Man and Dog)
  ('b1000000-0000-0000-0000-000000000011', 'acrylic', 'acrylic'),
  ('b1000000-0000-0000-0000-000000000011', 'canvas',  'canvas'),
  -- The Future is Old
  ('b1000000-0000-0000-0000-000000000012', 'oil paint', 'oil_paint'),
  ('b1000000-0000-0000-0000-000000000012', 'canvas',    'canvas'),
  -- El Festín
  ('b1000000-0000-0000-0000-000000000013', 'oil paint', 'oil_paint'),
  ('b1000000-0000-0000-0000-000000000013', 'canvas',    'canvas'),
  -- El Jardín
  ('b1000000-0000-0000-0000-000000000014', 'oil paint', 'oil_paint'),
  ('b1000000-0000-0000-0000-000000000014', 'canvas',    'canvas'),
  -- I Like People
  ('b1000000-0000-0000-0000-000000000015', 'acrylic',     'acrylic'),
  ('b1000000-0000-0000-0000-000000000015', 'mixed media', 'mixed_media'),
  ('b1000000-0000-0000-0000-000000000015', 'canvas',      'canvas');


-- ── 4. Locations ─────────────────────────────────────────────────────────────

insert into artwork_locations (artwork_id, city, country, map_image_url, creation_period) values
  ('b1000000-0000-0000-0000-000000000001', 'Bethlehem', 'Palestine',       '', '~ 1 night'),
  ('b1000000-0000-0000-0000-000000000002', 'New York',  'United States',   '', '~ 2 days'),
  ('b1000000-0000-0000-0000-000000000003', 'New York',  'United States',   '', '~ 3 weeks'),
  ('b1000000-0000-0000-0000-000000000004', 'New York',  'United States',   '', '~ 2 years'),
  ('b1000000-0000-0000-0000-000000000005', 'London',    'United Kingdom',  '', '~ 6 months'),
  ('b1000000-0000-0000-0000-000000000006', 'London',    'United Kingdom',  '', '~ 1 day'),
  ('b1000000-0000-0000-0000-000000000007', 'London',    'United Kingdom',  '', '~ 1 day'),
  ('b1000000-0000-0000-0000-000000000008', 'Bristol',   'United Kingdom',  '', '~ 1 night'),
  ('b1000000-0000-0000-0000-000000000009', 'London',    'United Kingdom',  '', '~ 1 night'),
  ('b1000000-0000-0000-0000-000000000010', 'London',    'United Kingdom',  '', '~ 1 night'),
  ('b1000000-0000-0000-0000-000000000011', 'New York',  'United States',   '', '~ 4 hours'),
  ('b1000000-0000-0000-0000-000000000012', 'Barcelona', 'Spain',           '', '~ 3 months'),
  ('b1000000-0000-0000-0000-000000000013', 'Santiago',  'Chile',           '', '~ 6 months'),
  ('b1000000-0000-0000-0000-000000000014', 'Santiago',  'Chile',           '', '~ 5 months'),
  ('b1000000-0000-0000-0000-000000000015', 'Barcelona', 'Spain',           '', '~ 2 months');


-- ── 5. Art movements ─────────────────────────────────────────────────────────
-- name = primary movement, pyramid_label_a/b/c = the three triangle corners
-- timeline_year = approximate peak year of movement

insert into art_movements (artwork_id, name, timeline_year, pyramid_label_a, pyramid_label_b, pyramid_label_c) values
  ('b1000000-0000-0000-0000-000000000001', 'Street art',        2003, 'Street art',      'Protest',      'Subversion'),
  ('b1000000-0000-0000-0000-000000000002', 'Pop art',           1982, 'Pop art',         'Graffiti',     'Activism'),
  ('b1000000-0000-0000-0000-000000000003', 'Neo-expressionism', 1983, 'Neo-expressionism','Pop',         'Street art'),
  ('b1000000-0000-0000-0000-000000000004', 'Neo-pop',           2014, 'Neo-pop',         'Kitsch',       'Conceptual'),
  ('b1000000-0000-0000-0000-000000000005', 'YBA',               2021, 'YBA',             'Neo-pop',      'Conceptual'),
  ('b1000000-0000-0000-0000-000000000006', 'Street art',        2010, 'Street art',      'Appropriation','Critique'),
  ('b1000000-0000-0000-0000-000000000007', 'Street art',        2002, 'Street art',      'Anti-war',     'Satire'),
  ('b1000000-0000-0000-0000-000000000008', 'Street art',        2001, 'Street art',      'Dark comedy',  'Subversion'),
  ('b1000000-0000-0000-0000-000000000009', 'Street art',        2006, 'Street art',      'Nature',       'Critique'),
  ('b1000000-0000-0000-0000-000000000010', 'Street art',        2003, 'Street art',      'Religious',    'Iconography'),
  ('b1000000-0000-0000-0000-000000000011', 'Pop art',           1982, 'Pop art',         'Graffiti',     'Subway art'),
  ('b1000000-0000-0000-0000-000000000012', 'New Figuration',    2022, 'New Figuration',  'Hyperrealism', 'Street culture'),
  ('b1000000-0000-0000-0000-000000000013', 'Magical realism',   2019, 'Magical realism', 'Hyperrealism', 'Salon painting'),
  ('b1000000-0000-0000-0000-000000000014', 'Magical realism',   2018, 'Magical realism', 'Fairy painting','Hyperrealism'),
  ('b1000000-0000-0000-0000-000000000015', 'Social commentary', 2024, 'Social commentary','Figuration',  'Satire');


-- ── 6. Artwork media (placeholder URLs) ──────────────────────────────────────

insert into artwork_media (artwork_id, type, url, display_order) values
  ('b1000000-0000-0000-0000-000000000001', 'main_image', '', 1),
  ('b1000000-0000-0000-0000-000000000002', 'main_image', '', 1),
  ('b1000000-0000-0000-0000-000000000003', 'main_image', '', 1),
  ('b1000000-0000-0000-0000-000000000004', 'main_image', '', 1),
  ('b1000000-0000-0000-0000-000000000005', 'main_image', '', 1),
  ('b1000000-0000-0000-0000-000000000006', 'main_image', '', 1),
  ('b1000000-0000-0000-0000-000000000007', 'main_image', '', 1),
  ('b1000000-0000-0000-0000-000000000008', 'main_image', '', 1),
  ('b1000000-0000-0000-0000-000000000009', 'main_image', '', 1),
  ('b1000000-0000-0000-0000-000000000010', 'main_image', '', 1),
  ('b1000000-0000-0000-0000-000000000011', 'main_image', '', 1),
  ('b1000000-0000-0000-0000-000000000012', 'main_image', '', 1),
  ('b1000000-0000-0000-0000-000000000013', 'main_image', '', 1),
  ('b1000000-0000-0000-0000-000000000014', 'main_image', '', 1),
  ('b1000000-0000-0000-0000-000000000015', 'main_image', '', 1);
