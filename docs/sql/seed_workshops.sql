    INSERT INTO workshops (id, title, description)
    VALUES
        ('acrylic', 'Acrylic on canvas', 'Layer bold colour, one brushstroke at a time.'),
        ('watercolor', 'Watercolour on paper', 'Let pigment and water find their own edges.'),
        ('pottery', 'Paint on pottery', 'Turn an everyday piece into something of your own.')
    ON DUPLICATE KEY UPDATE id = workshops.id;
