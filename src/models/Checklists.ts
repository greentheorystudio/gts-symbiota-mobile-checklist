import { capSQLiteChanges, DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';

import { escapeSqlSingleQuotes } from 'src/hooks/core';

export interface ChecklistsInterface {
    createChecklist(db: SQLiteDBConnection | undefined, checklist: any): Promise<capSQLiteChanges | undefined>;
    deleteChecklist(db: SQLiteDBConnection | undefined, clid: number): Promise<capSQLiteChanges | undefined>;
    getChecklistById(db: SQLiteDBConnection | undefined, clid: number): Promise<DBSQLiteValues | undefined>;
    getChecklists(db: SQLiteDBConnection | undefined): Promise<DBSQLiteValues | undefined>;
}

class Checklists implements ChecklistsInterface {

    async createChecklist(db: SQLiteDBConnection | undefined, checklist: any): Promise<capSQLiteChanges | undefined> {
        let returnVal;
        if(db !== undefined){
            let sql = 'INSERT INTO checklists(clid, `name`, title, locality, publication, abstract, authors, notes, publishtimestamp, defaultSettings) VALUES (';
            sql += Number(checklist.clid) + ",'" + escapeSqlSingleQuotes(checklist.name) + "',";
            sql += (checklist.title ? "'" + escapeSqlSingleQuotes(checklist.title) + "'" : 'NULL') + ',';
            sql += (checklist.locality ? "'" + escapeSqlSingleQuotes(checklist.locality) + "'" : 'NULL') + ',';
            sql += (checklist.publication ? "'" + escapeSqlSingleQuotes(checklist.publication) + "'" : 'NULL') + ',';
            sql += (checklist.abstract ? "'" + escapeSqlSingleQuotes(checklist.abstract) + "'" : 'NULL') + ',';
            sql += (checklist.authors ? "'" + escapeSqlSingleQuotes(checklist.authors) + "'" : 'NULL') + ',';
            sql += (checklist.notes ? "'" + escapeSqlSingleQuotes(checklist.notes) + "'" : 'NULL') + ',';
            sql += Number(checklist.publishtimestamp) + ',';
            sql += (checklist.defaultSettings ? "'" + escapeSqlSingleQuotes(checklist.defaultSettings) + "'" : 'NULL') + ')';
            returnVal = await db.run(sql);
        }
        return returnVal;
    }

    async deleteChecklist(db: SQLiteDBConnection | undefined, clid: number): Promise<capSQLiteChanges | undefined> {
        let returnVal;
        if(db !== undefined){
            let sql = ('DELETE FROM checklists WHERE clid = ' + clid.toString() + ';');
            returnVal = await db.run(sql);
        }
        return returnVal;
    }

    async getChecklistById(db: SQLiteDBConnection | undefined, clid: number): Promise<DBSQLiteValues | undefined> {
        let returnVal;
        if(db !== undefined){
            returnVal = await db.query('SELECT * FROM checklists WHERE clid = ' + clid.toString() + ';');
        }
        return returnVal;
    }

    async getChecklists(db: SQLiteDBConnection | undefined): Promise<DBSQLiteValues | undefined> {
        let returnVal;
        if(db !== undefined){
            returnVal = await db.query('SELECT * FROM checklists;');
        }
        return returnVal;
    }
}

export default Checklists;
