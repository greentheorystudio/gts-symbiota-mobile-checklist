import {
    CapacitorSQLite,
    SQLiteConnection,
    SQLiteDBConnection
} from '@capacitor-community/sqlite';
import { Filesystem,  Directory, Encoding } from '@capacitor/filesystem';

export interface DatabaseServiceInterface {
    createDatabaseConnection(): Promise<boolean>;
    createDatabaseJsonFile(): Promise<void>;
    saveDatabaseToFile(database: SQLiteDBConnection): Promise<void>;
}

class DatabaseService implements DatabaseServiceInterface {

    databaseConnection: SQLiteDBConnection|null = null;
    sqliteConnection = new SQLiteConnection(CapacitorSQLite);

    async createDatabaseConnection(): Promise<boolean> {
        let connectionEstablished = false;
        const databaseJsonStr = await Filesystem.readFile({
            path: 'mobile-checklist/database/database.json',
            directory: Directory.Data,
            encoding: Encoding.UTF8,
        });
        if(databaseJsonStr.data && typeof databaseJsonStr.data === 'string'){
            const result = await this.sqliteConnection.importFromJson(databaseJsonStr.data);
            console.log(result);
            this.databaseConnection = await this.sqliteConnection.createConnection(
                'mobileChecklistDb',
                false,
                'no-encryption',
                0,
                false
            );
            const databaseConnected = await this.sqliteConnection.isConnection('mobileChecklistDb', false);
            console.log(databaseConnected);
            if(databaseConnected.result){
                connectionEstablished = true;
            }
        }
        return connectionEstablished;
    }

    async createDatabaseJsonFile(): Promise<void> {
        const db = await this.sqliteConnection.createConnection(
            'mobileChecklistDb',
            false,
            'no-encryption',
            0,
            false
        );
        await this.saveDatabaseToFile(db);
        return;
    }

    async saveDatabaseToFile(database: SQLiteDBConnection): Promise<void> {
        const dbJson = await database.exportToJson('full', false);
        await Filesystem.writeFile({
            path: 'mobile-checklist/database/database.json',
            data: JSON.stringify(dbJson),
            directory: Directory.Data,
            encoding: Encoding.UTF8,
        });
        return;
    }
}

export default DatabaseService;
