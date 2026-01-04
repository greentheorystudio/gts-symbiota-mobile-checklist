import { capSQLiteChanges, DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';

import { escapeSqlSingleQuotes } from 'src/hooks/core';

export interface CharacterHeadingsInterface {
    createCharacterHeading(db: SQLiteDBConnection | undefined, characterHeading: any): Promise<capSQLiteChanges | undefined>;
    deleteCharacterHeading(db: SQLiteDBConnection | undefined, clid: number): Promise<capSQLiteChanges | undefined>;
    getCharacterHeadingById(db: SQLiteDBConnection | undefined, clid: number): Promise<DBSQLiteValues | undefined>;
}

class CharacterHeadings implements CharacterHeadingsInterface {

    async createCharacterHeading(db: SQLiteDBConnection | undefined, characterHeading: any): Promise<capSQLiteChanges | undefined> {
        let returnVal;
        if(db !== undefined){
            let sql = 'INSERT INTO characterHeadings(clid, dataJson) VALUES (';
            sql += Number(characterHeading.clid) + ",";
            sql += (characterHeading.data ? "'" + escapeSqlSingleQuotes(characterHeading.data) + "'" : 'NULL') + ')';
            returnVal = await db.run(sql);
        }
        return returnVal;
    }

    async deleteCharacterHeading(db: SQLiteDBConnection | undefined, clid: number): Promise<capSQLiteChanges | undefined> {
        let returnVal;
        if(db !== undefined){
            let sql = ('DELETE FROM characterHeadings WHERE clid = ' + clid.toString() + ';');
            returnVal = await db.run(sql);
        }
        return returnVal;
    }

    async getCharacterHeadingById(db: SQLiteDBConnection | undefined, clid: number): Promise<DBSQLiteValues | undefined> {
        let returnVal;
        if(db !== undefined){
            returnVal = await db.query('SELECT * FROM characterHeadings WHERE clid = ' + clid.toString() + ';');
        }
        return returnVal;
    }
}

export default CharacterHeadings;
