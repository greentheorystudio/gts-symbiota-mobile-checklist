interface Statement {
    toVersion: number;
    statements: string[];
}

export const DatabaseUpdateStatements: Statement[] = [
    {
        toVersion: 1,
        statements: [
            `CREATE TABLE IF NOT EXISTS characterHeadings (
                clid INTEGER NOT NULL,
                chid INTEGER NOT NULL,
                headingname TEXT(255) NOT NULL,
                langid INTEGER,
                language TEXT(45),
                sortsequence INTEGER
            );`,
            `CREATE TABLE IF NOT EXISTS characterStates (
                clid INTEGER NOT NULL,
                csid INTEGER NOT NULL,
                cid INTEGER NOT NULL,
                characterstatename TEXT(255) NOT NULL,
                description TEXT(255),
                language TEXT(45),
                langid INTEGER,
                sortsequence INTEGER
            );`,
            `CREATE TABLE IF NOT EXISTS characters (
                clid INTEGER NOT NULL,
                cid INTEGER NOT NULL,
                chid INTEGER NOT NULL,
                charactername TEXT(150) NOT NULL,
                description TEXT(255),
                language TEXT(45),
                langid INTEGER,
                sortsequence INTEGER,
                dependencyArrJson TEXT
            );`,
            `CREATE TABLE IF NOT EXISTS checklistImages (
                clid INTEGER NOT NULL,
                tid INTEGER NOT NULL,
                imgid INTEGER NOT NULL,
                filePath TEXT NOT NULL,
                sourceUrl TEXT NOT NULL
            );`,
            `CREATE TABLE IF NOT EXISTS checklistTaxa (
                clid INTEGER NOT NULL,
                tid INTEGER NOT NULL,
                dataJson TEXT NOT NULL
            );`,
            `CREATE TABLE IF NOT EXISTS checklists (
                clid INTEGER NOT NULL,
                name TEXT(100) NOT NULL,
                title TEXT(100),
                locality TEXT(500),
                publication TEXT(500),
                abstract TEXT,
                authors TEXT(250),
                notes TEXT(500),
                defaultSettings TEXT,
                PRIMARY KEY (clid)
            );`,
            'CREATE INDEX chid_characterHeadings ON characterHeadings (chid ASC);',
            'CREATE INDEX clid_characterHeadings ON characterHeadings (clid ASC);',
            'CREATE INDEX headingname_characterHeadings ON characterHeadings (headingname ASC);',
            'CREATE INDEX langid_characterHeadings ON characterHeadings (langid ASC);',
            'CREATE INDEX language_characterHeadings ON characterHeadings (language ASC);',
            'CREATE INDEX characterstatename_characterStates ON characterStates (characterstatename ASC);',
            'CREATE INDEX clid_characterStates ON characterStates (clid ASC);',
            'CREATE INDEX csid_characterStates ON characterStates (csid ASC);',
            'CREATE INDEX langid_characterStates ON characterStates (langid ASC);',
            'CREATE INDEX language_characterStates ON characterStates (language ASC);',
            'CREATE INDEX charactername_characters ON characters (charactername ASC);',
            'CREATE INDEX chid_characters ON characters (chid ASC);',
            'CREATE INDEX cid_characters ON characters (cid ASC);',
            'CREATE INDEX clid_characters ON characters (clid ASC);',
            'CREATE INDEX langid_characters ON characters (langid ASC);',
            'CREATE INDEX language_characters ON characters (language ASC);',
            'CREATE INDEX clid_checklistImages ON checklistImages (clid ASC);',
            'CREATE INDEX sourceUrl_checklistImages ON checklistImages (sourceUrl ASC);',
            'CREATE INDEX tid_checklistImages ON checklistImages (tid ASC);',
            'CREATE INDEX clid_checklistTaxa ON checklistTaxa (clid ASC);',
            'CREATE INDEX tid_checklistTaxa ON checklistTaxa (tid ASC);'
        ]
    }
];
