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

    databaseConnection: SQLiteDBConnection|undefined;
    newestDbVersion = 0;
    sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    sqlitePlugin = CapacitorSQLite;
    updateStatements = DatabaseUpdateStatements;

    async createDatabaseConnection(): Promise<boolean> {
        let connectionEstablished = false;
        const databaseJsonStr = await Filesystem.readFile({
            path: 'mobile-checklist/database/database.json',
            directory: Directory.Data,
            encoding: Encoding.UTF8,
        });
        if(databaseJsonStr.data && typeof databaseJsonStr.data === 'string'){
            await this.sqliteConnection.importFromJson(databaseJsonStr.data);
            await this.setDatabaseConnection();
            if(this.databaseConnection){
                const tables = await this.databaseConnection.getTableList();
                connectionEstablished = true;
            }
        }
        return connectionEstablished;
    }

    async createDatabaseJsonFile(): Promise<void> {
        await this.setDatabaseConnection();
        if(this.databaseConnection){
            const tables = await this.databaseConnection.getTableList();
            await this.saveDatabaseToFile();
        }
        return;
    }

    async initWebStore(): Promise<void> {
        await this.sqliteConnection.initWebStore();
        return;
    }

    async openDatabase(): Promise<SQLiteDBConnection | undefined> {
        let db = await this.sqliteConnection.createConnection(
            'mobileChecklistDb',
            false,
            'no-encryption',
            this.newestDbVersion,
            false
        );
        await db.open();
        return db;
    }

    async runDatabaseUpdates(): Promise<void> {
        await this.sqlitePlugin.addUpgradeStatement({
            database: 'mobileChecklistDb',
            upgrade: this.updateStatements,
        });
        return;
    }

    async saveDatabaseToFile(): Promise<void> {
        if(this.databaseConnection){
            const dbJson = await this.databaseConnection.exportToJson('full', false);
            await Filesystem.writeFile({
                path: 'mobile-checklist/database/database.json',
                data: JSON.stringify(dbJson.export),
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            });
        }
        return;
    }

    async setDatabaseConnection(): Promise<void> {
        await this.runDatabaseUpdates();
        this.databaseConnection = await this.openDatabase();
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
