import { capSQLiteChanges, DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';

import { escapeSqlSingleQuotes } from 'src/hooks/core';

export interface ChecklistMapImagesInterface {
    batchCreateChecklistMapImages(db: SQLiteDBConnection | undefined, checklistImageArr: any[]): Promise<capSQLiteChanges | undefined>;
    deleteChecklistMapImages(db: SQLiteDBConnection | undefined, clid: number): Promise<capSQLiteChanges | undefined>;
    getChecklistMapImagesById(db: SQLiteDBConnection | undefined, clid: number): Promise<DBSQLiteValues | undefined>;
}

class ChecklistMapImages implements ChecklistMapImagesInterface {

    async batchCreateChecklistMapImages(db: SQLiteDBConnection | undefined, checklistMapImageArr: any[]): Promise<capSQLiteChanges | undefined> {
        const valArr: string[] = [];
        let returnVal;
        if(db !== undefined){
            let sql = 'INSERT INTO checklistMapImages(clid, tid, title, filePath) VALUES ';
            checklistMapImageArr.forEach((image) => {
                let sqlStr = '(';
                sqlStr += Number(image.clid) + "," + Number(image.tid) + ",";
                sqlStr += (image.title ? "'" + escapeSqlSingleQuotes(image.title) + "'" : 'NULL') + ',';
                sqlStr +=  "'" + escapeSqlSingleQuotes(image.filePath) + "'";
                sqlStr += ')';
                valArr.push(sqlStr);
            });
            sql += valArr.join(',');
            returnVal = await db.run(sql);
        }
        return returnVal;
    }

    async deleteChecklistMapImages(db: SQLiteDBConnection | undefined, clid: number): Promise<capSQLiteChanges | undefined> {
        let returnVal;
        if(db !== undefined){
            let sql = ('DELETE FROM checklistMapImages WHERE clid = ' + clid.toString() + ';');
            returnVal = await db.run(sql);
        }
        return returnVal;
    }

    async getChecklistMapImagesById(db: SQLiteDBConnection | undefined, clid: number): Promise<DBSQLiteValues | undefined> {
        let returnVal;
        if(db !== undefined){
            returnVal = await db.query('SELECT * FROM checklistMapImages WHERE clid = ' + clid.toString() + ';');
        }
        return returnVal;
    }
}

export default ChecklistMapImages;
