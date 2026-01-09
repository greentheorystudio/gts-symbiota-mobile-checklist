export const DatabaseSchemaStatements: string[] = [
    'DROP TABLE IF EXISTS characterStates;',
    'DROP TABLE IF EXISTS characters;',
    'DROP TABLE IF EXISTS characterHeadings;',
    'DROP TABLE IF EXISTS checklistImages;',
    'DROP TABLE IF EXISTS checklistTaxa;',
    'DROP TABLE IF EXISTS checklists;',
    `CREATE TABLE characterHeadings (
        clid INTEGER NOT NULL,
        dataJson TEXT,
        PRIMARY KEY (clid)
    );`,
    `CREATE TABLE characterStates (
        clid INTEGER NOT NULL,
        dataJson TEXT,
        PRIMARY KEY (clid)
    );`,
    `CREATE TABLE characters (
        clid INTEGER NOT NULL,
        dataJson TEXT,
        PRIMARY KEY (clid)
    );`,
    `CREATE TABLE checklistImages (
        clid INTEGER NOT NULL,
        tid INTEGER NOT NULL,
        photographer TEXT(100),
        owner TEXT(250),
        filePath TEXT NOT NULL
    );`,
    `CREATE TABLE checklistTaxa (
        clid INTEGER NOT NULL,
        tid INTEGER NOT NULL,
        rankid INTEGER NOT NULL,
        sciname TEXT(250),
        author TEXT(100),
        family TEXT(50),
        habitat TEXT(250),
        notes TEXT(2000),
        abundance TEXT(50),
        descriptionJson TEXT,
        keyJson TEXT,
        synonymyJson TEXT,
        vernacularJson TEXT
    );`,
    `CREATE TABLE checklists (
        clid INTEGER NOT NULL,
        name TEXT(100) NOT NULL,
        title TEXT(100),
        locality TEXT(500),
        publication TEXT(500),
        abstract TEXT,
        authors TEXT(250),
        notes TEXT(500),
        defaultSettings TEXT,
        publishtimestamp INTEGER NOT NULL,
        PRIMARY KEY (clid)
    );`,
    'CREATE INDEX clid_checklistImages ON checklistImages (clid ASC);',
    'CREATE INDEX tid_checklistImages ON checklistImages (tid ASC);',
    'CREATE INDEX clid_checklistTaxa ON checklistTaxa (clid ASC);',
    'CREATE INDEX tid_checklistTaxa ON checklistTaxa (tid ASC);'
];
