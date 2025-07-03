import { SQLiteDBConnection } from '@capacitor-community/sqlite';

export interface ChecklistInterface {
    clid: number;
    name: string;
    title: string;
    locality: string;
    publication: string;
    abstract: string;
    authors: string;
    notes: string;
    defaultSettings: string;
}

export interface ChecklistsInterface {
    getChecklists(db: SQLiteDBConnection|undefined): Promise<ChecklistInterface[]>;
}

class Checklists implements ChecklistsInterface {

    async getChecklists(db: SQLiteDBConnection|undefined): Promise<ChecklistInterface[]> {
        let returnArr: ChecklistInterface[] = [];
        if(db !== undefined){
            const results = await db.query('SELECT * FROM checklists;');
            if(results && results.hasOwnProperty('values')){
                returnArr = results.values as ChecklistInterface[];
            }
        }
        return returnArr;
    }
}

export default Checklists;
