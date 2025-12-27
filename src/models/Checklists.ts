import { capSQLiteChanges, DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';

import { ChecklistInterface } from 'src/interfaces/ChecklistInterface';

export interface ChecklistsInterface {
    getChecklists(db: SQLiteDBConnection | undefined): Promise<DBSQLiteValues | undefined>;
}

class Checklists implements ChecklistsInterface {

    async createChecklist(db: SQLiteDBConnection | undefined, checklist: any): Promise<capSQLiteChanges | undefined> {
        let returnVal;
        if(db !== undefined){
            let sql = 'INSERT INTO checklists(clid, `name`, title, locality, publication, abstract, authors, notes, defaultSettings) VALUES (';
            sql += Number(checklist.clid) + ",'" + checklist.name + "',";
            sql += (checklist.title ? "'" + checklist.title + "'" : 'NULL') + ',';
            sql += (checklist.locality ? "'" + checklist.locality + "'" : 'NULL') + ',';
            sql += (checklist.publication ? "'" + checklist.publication + "'" : 'NULL') + ',';
            sql += (checklist.abstract ? "'" + checklist.abstract + "'" : 'NULL') + ',';
            sql += (checklist.authors ? "'" + checklist.authors + "'" : 'NULL') + ',';
            sql += (checklist.notes ? "'" + checklist.notes + "'" : 'NULL') + ',';
            sql += (checklist.defaultsettings ? "'" + JSON.stringify(checklist.defaultsettings) + "'" : 'NULL') + ')';
            console.log(sql);
            returnVal = await db.run(sql);
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
