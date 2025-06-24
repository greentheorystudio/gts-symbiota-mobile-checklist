import {
    CapacitorSQLite,
    SQLiteConnection,
    SQLiteDBConnection
} from '@capacitor-community/sqlite';
import { Filesystem,  Directory, Encoding } from '@capacitor/filesystem';

import { DatabaseUpdateStatements } from '../updates/database.statements';

export interface DatabaseServiceInterface {
    createDatabaseConnection(): Promise<boolean>;
    createDatabaseJsonFile(): Promise<void>;
    initWebStore(): Promise<void>;
    runDatabaseUpdates(): Promise<void>;
    saveDatabaseToFile(database: SQLiteDBConnection): Promise<void>;
    setNewestDbVersionNumber(): Promise<void>;
}

class DatabaseService implements DatabaseServiceInterface {

    databaseConnection: SQLiteDBConnection|null = null;
    newestDbVersion = 0;
    sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    sqlitePlugin = CapacitorSQLite;
    updateStatements = DatabaseUpdateStatements;

    async createDatabaseConnection(): Promise<boolean> {
        let connectionEstablished = false;
        await this.setNewestDbVersionNumber();
        const databaseJsonStr = await Filesystem.readFile({
            path: 'mobile-checklist/database/database.json',
            directory: Directory.Data,
            encoding: Encoding.UTF8,
        });
        console.log(databaseJsonStr);
        if(databaseJsonStr.data && typeof databaseJsonStr.data === 'string'){
            const result = await this.sqliteConnection.importFromJson(databaseJsonStr.data);
            console.log(result);
            this.databaseConnection = await this.sqliteConnection.createConnection(
                'mobileChecklistDb',
                false,
                'no-encryption',
                1,
                false
            );
            await this.runDatabaseUpdates();
            await this.databaseConnection.open();
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
            1,
            false
        );
        await db.open();
        await this.runDatabaseUpdates();
        const tables = await db.getTableList();
        console.log(tables);
        //await this.saveDatabaseToFile(db);
        return;
    }

    async initWebStore(): Promise<void> {
        await this.sqliteConnection.initWebStore();
        return;
    }

    async runDatabaseUpdates(): Promise<void> {
        await this.sqlitePlugin.addUpgradeStatement({
            database: 'mobileChecklistDb',
            upgrade: this.updateStatements,
        });
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

    async setNewestDbVersionNumber(): Promise<void> {
        this.updateStatements.forEach((statement) => {
            this.newestDbVersion = Number(statement.toVersion);
        });
        return;
    }
}

export default DatabaseService;
