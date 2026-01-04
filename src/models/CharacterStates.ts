import { capSQLiteChanges, DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';

import { escapeSqlSingleQuotes } from 'src/hooks/core';

export interface CharacterStatesInterface {
    createCharacterState(db: SQLiteDBConnection | undefined, characterState: any): Promise<capSQLiteChanges | undefined>;
    deleteCharacterState(db: SQLiteDBConnection | undefined, clid: number): Promise<capSQLiteChanges | undefined>;
    getCharacterStateById(db: SQLiteDBConnection | undefined, clid: number): Promise<DBSQLiteValues | undefined>;
}

class CharacterStates implements CharacterStatesInterface {

    async createCharacterState(db: SQLiteDBConnection | undefined, characterState: any): Promise<capSQLiteChanges | undefined> {
        let returnVal;
        if(db !== undefined){
            let sql = 'INSERT INTO characterStates(clid, dataJson) VALUES (';
            sql += Number(characterState.clid) + ",";
            sql += (characterState.data ? "'" + escapeSqlSingleQuotes(characterState.data) + "'" : 'NULL') + ')';
            returnVal = await db.run(sql);
        }
        return returnVal;
    }

    async deleteCharacterState(db: SQLiteDBConnection | undefined, clid: number): Promise<capSQLiteChanges | undefined> {
        let returnVal;
        if(db !== undefined){
            let sql = ('DELETE FROM characterStates WHERE clid = ' + clid.toString() + ';');
            returnVal = await db.run(sql);
        }
        return returnVal;
    }

    async getCharacterStateById(db: SQLiteDBConnection | undefined, clid: number): Promise<DBSQLiteValues | undefined> {
        let returnVal;
        if(db !== undefined){
            returnVal = await db.query('SELECT * FROM characterStates WHERE clid = ' + clid.toString() + ';');
        }
        return returnVal;
    }
}

export default CharacterStates;
