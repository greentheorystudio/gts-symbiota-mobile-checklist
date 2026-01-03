import { capSQLiteChanges, DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';

import { escapeSqlSingleQuotes } from 'src/hooks/core';

export interface ChecklistImagesInterface {
    batchCreateChecklistImages(db: SQLiteDBConnection | undefined, checklistImageArr: any[]): Promise<capSQLiteChanges | undefined>;
    deleteChecklistImages(db: SQLiteDBConnection | undefined, clid: number): Promise<capSQLiteChanges | undefined>;
    getChecklistImagesById(db: SQLiteDBConnection | undefined, clid: number): Promise<DBSQLiteValues | undefined>;
}

class ChecklistImages implements ChecklistImagesInterface {

    async batchCreateChecklistImages(db: SQLiteDBConnection | undefined, checklistImageArr: any[]): Promise<capSQLiteChanges | undefined> {
        const valArr: string[] = [];
        let returnVal;
        if(db !== undefined){
            let sql = 'INSERT INTO checklistImages(clid, tid, photographer, owner, filePath) VALUES ';
            checklistImageArr.forEach((image) => {
                let sqlStr = '(';
                sqlStr += Number(image.clid) + "," + Number(image.tid) + ",";
                sqlStr += (image.photographer ? "'" + escapeSqlSingleQuotes(image.photographer) + "'" : 'NULL') + ',';
                sqlStr += (image.owner ? "'" + escapeSqlSingleQuotes(image.owner) + "'" : 'NULL') + ',';
                sqlStr +=  "'" + escapeSqlSingleQuotes(image.filePath) + "'";
                sqlStr += ')';
                valArr.push(sqlStr);
            });
            sql += valArr.join(',');
            returnVal = await db.run(sql);
        }
        return returnVal;
    }

    async deleteChecklistImages(db: SQLiteDBConnection | undefined, clid: number): Promise<capSQLiteChanges | undefined> {
        let returnVal;
        if(db !== undefined){
            let sql = ('DELETE FROM checklistImages WHERE clid = ' + clid.toString() + ';');
            returnVal = await db.run(sql);
        }
        return returnVal;
    }

    async getChecklistImagesById(db: SQLiteDBConnection | undefined, clid: number): Promise<DBSQLiteValues | undefined> {
        let returnVal;
        if(db !== undefined){
            returnVal = await db.query('SELECT * FROM checklistImages WHERE clid = ' + clid.toString() + ';');
        }
        return returnVal;
    }
}

export default ChecklistImages;
