import { capSQLiteChanges, DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';

import { escapeSqlSingleQuotes } from 'src/hooks/core';

export interface CharactersInterface {
    createCharacter(db: SQLiteDBConnection | undefined, character: any): Promise<capSQLiteChanges | undefined>;
    deleteCharacter(db: SQLiteDBConnection | undefined, clid: number): Promise<capSQLiteChanges | undefined>;
    getCharacterById(db: SQLiteDBConnection | undefined, clid: number): Promise<DBSQLiteValues | undefined>;
}

class Characters implements CharactersInterface {

    async createCharacter(db: SQLiteDBConnection | undefined, character: any): Promise<capSQLiteChanges | undefined> {
        let returnVal;
        if(db !== undefined){
            let sql = 'INSERT INTO characters(clid, dataJson) VALUES (';
            sql += Number(character.clid) + ",";
            sql += (character.data ? "'" + escapeSqlSingleQuotes(JSON.stringify(character.data)) + "'" : 'NULL') + ')';
            returnVal = await db.run(sql);
        }
        return returnVal;
    }

    async deleteCharacter(db: SQLiteDBConnection | undefined, clid: number): Promise<capSQLiteChanges | undefined> {
        let returnVal;
        if(db !== undefined){
            let sql = ('DELETE FROM characters WHERE clid = ' + clid.toString() + ';');
            returnVal = await db.run(sql);
        }
        return returnVal;
    }

    async getCharacterById(db: SQLiteDBConnection | undefined, clid: number): Promise<DBSQLiteValues | undefined> {
        let returnVal;
        if(db !== undefined){
            returnVal = await db.query('SELECT * FROM characters WHERE clid = ' + clid.toString() + ';');
        }
        return returnVal;
    }
}

export default Characters;
