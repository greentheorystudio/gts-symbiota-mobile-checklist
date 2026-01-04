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
                dataJson TEXT,
                PRIMARY KEY (clid)
            );`,
            `CREATE TABLE IF NOT EXISTS characterStates (
                clid INTEGER NOT NULL,
                dataJson TEXT,
                PRIMARY KEY (clid)
            );`,
            `CREATE TABLE IF NOT EXISTS characters (
                clid INTEGER NOT NULL,
                dataJson TEXT,
                PRIMARY KEY (clid)
            );`,
            `CREATE TABLE IF NOT EXISTS checklistImages (
                clid INTEGER NOT NULL,
                tid INTEGER NOT NULL,
                photographer TEXT(100),
                owner TEXT(250),
                filePath TEXT NOT NULL
            );`,
            `CREATE TABLE IF NOT EXISTS checklistTaxa (
                clid INTEGER NOT NULL,
                tid INTEGER NOT NULL,
                rankid INTEGER NOT NULL,
                sciname TEXT(250),
                author TEXT(100),
                family TEXT(50),
                descriptionJson TEXT,
                keyJson TEXT,
                synonymyJson TEXT,
                vernacularJson TEXT
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
                publishtimestamp INTEGER NOT NULL,
                PRIMARY KEY (clid)
            );`,
            'CREATE INDEX clid_checklistImages ON checklistImages (clid ASC);',
            'CREATE INDEX tid_checklistImages ON checklistImages (tid ASC);',
            'CREATE INDEX clid_checklistTaxa ON checklistTaxa (clid ASC);',
            'CREATE INDEX tid_checklistTaxa ON checklistTaxa (tid ASC);'
        ]
    }
];
