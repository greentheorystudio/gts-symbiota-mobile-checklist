import { capSQLiteChanges, DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';

import { escapeSqlSingleQuotes } from 'src/hooks/core';

export interface ChecklistTaxaInterface {
    batchCreateChecklistTaxa(db: SQLiteDBConnection | undefined, checklistTaxaArr: any[]): Promise<capSQLiteChanges | undefined>;
    deleteChecklistTaxa(db: SQLiteDBConnection | undefined, clid: number): Promise<capSQLiteChanges | undefined>;
    getChecklistTaxaById(db: SQLiteDBConnection | undefined, clid: number): Promise<DBSQLiteValues | undefined>;
}

class ChecklistTaxa implements ChecklistTaxaInterface {

    async batchCreateChecklistTaxa(db: SQLiteDBConnection | undefined, checklistTaxaArr: any[]): Promise<capSQLiteChanges | undefined> {
        const valArr: string[] = [];
        let returnVal;
        if(db !== undefined){
            let sql = 'INSERT INTO checklistTaxa(clid, tid, rankid, sciname, author, family, acceptedRankid, acceptedSciname, acceptedAuthor, acceptedFamily, descriptionJson, keyJson, synonymyJson, vernacularJson) VALUES ';
            checklistTaxaArr.forEach((taxon) => {
                let sqlStr = '(';
                sqlStr += Number(taxon.clid) + "," + Number(taxon.tid) + "," + Number(taxon.rankid) + ",";
                sqlStr += (taxon.sciname ? "'" + escapeSqlSingleQuotes(taxon.sciname) + "'" : 'NULL') + ',';
                sqlStr += (taxon.author ? "'" + escapeSqlSingleQuotes(taxon.author) + "'" : 'NULL') + ',';
                sqlStr += (taxon.family ? "'" + escapeSqlSingleQuotes(taxon.family) + "'" : 'NULL') + ',';
                sqlStr += Number(taxon.acceptedRankid) + ","
                sqlStr += (taxon.acceptedSciname ? "'" + escapeSqlSingleQuotes(taxon.acceptedSciname) + "'" : 'NULL') + ',';
                sqlStr += (taxon.acceptedAuthor ? "'" + escapeSqlSingleQuotes(taxon.acceptedAuthor) + "'" : 'NULL') + ',';
                sqlStr += (taxon.acceptedFamily ? "'" + escapeSqlSingleQuotes(taxon.acceptedFamily) + "'" : 'NULL') + ',';
                sqlStr += (taxon.descriptionJson ? "'" + escapeSqlSingleQuotes(JSON.stringify(taxon.descriptionJson)) + "'" : 'NULL') + ',';
                sqlStr += (taxon.keyJson ? "'" + escapeSqlSingleQuotes(JSON.stringify(taxon.keyJson)) + "'" : 'NULL') + ',';
                sqlStr += (taxon.synonymyJson ? "'" + escapeSqlSingleQuotes(JSON.stringify(taxon.synonymyJson)) + "'" : 'NULL') + ',';
                sqlStr += (taxon.vernacularJson ? "'" + escapeSqlSingleQuotes(JSON.stringify(taxon.vernacularJson)) + "'" : 'NULL');
                sqlStr += ')';
                valArr.push(sqlStr);
            });
            sql += valArr.join(',');
            returnVal = await db.run(sql);
        }
        return returnVal;
    }

    async deleteChecklistTaxa(db: SQLiteDBConnection | undefined, clid: number): Promise<capSQLiteChanges | undefined> {
        let returnVal;
        if(db !== undefined){
            let sql = ('DELETE FROM checklistTaxa WHERE clid = ' + clid.toString() + ';');
            returnVal = await db.run(sql);
        }
        return returnVal;
    }

    async getChecklistTaxaById(db: SQLiteDBConnection | undefined, clid: number): Promise<DBSQLiteValues | undefined> {
        let returnVal;
        if(db !== undefined){
            returnVal = await db.query('SELECT * FROM checklistTaxa WHERE clid = ' + clid.toString() + ';');
        }
        return returnVal;
    }
}

export default ChecklistTaxa;
