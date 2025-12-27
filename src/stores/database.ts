import {
    CapacitorSQLite,
    SQLiteConnection,
    SQLiteDBConnection
} from '@capacitor-community/sqlite';
import { Filesystem,  Directory, Encoding } from '@capacitor/filesystem';
import { defineStore } from 'pinia';
import { ComputedRef, ref, Ref, computed } from 'vue';

import { DatabaseUpdateStatements } from '../updates/database.statements';

export const useDatabaseStore = defineStore('database', () => {
    const databaseConnection: Ref<SQLiteDBConnection | undefined> = ref(undefined);
    const newestDbVersion = ref(0);
    const runtimeEnvironment: Ref<string | null> = ref(null);
    const sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    const sqlitePlugin = CapacitorSQLite;
    const updateStatements = DatabaseUpdateStatements;

    const getDatabaseConnection: ComputedRef<SQLiteDBConnection | undefined> = computed(() => {
        return databaseConnection.value;
    });

    async function createDatabaseConnection(): Promise<boolean> {
        let connectionEstablished = false;
        const databaseJsonStr = await Filesystem.readFile({
            path: 'mobile-checklist/database/database.json',
            directory: Directory.Data,
            encoding: Encoding.UTF8,
        });
        if(databaseJsonStr.data && typeof databaseJsonStr.data === 'string'){
            await sqliteConnection.importFromJson(databaseJsonStr.data);
            await setDatabaseConnection();
            if(databaseConnection.value){
                connectionEstablished = true;
            }
        }
        return connectionEstablished;
    }

    async function createDatabaseJsonFile(): Promise<void> {
        await setDatabaseConnection();
        if(databaseConnection.value){
            await processDatabaseChange();
        }
        return;
    }

    async function initWebStore(): Promise<void> {
        await sqliteConnection.initWebStore();
        return;
    }

    async function openDatabase(): Promise<SQLiteDBConnection | undefined> {
        let db = await sqliteConnection.createConnection(
            'mobileChecklistDb',
            false,
            'no-encryption',
            newestDbVersion.value,
            false
        );
        await db.open();
        return db;
    }

    async function processDatabaseChange(): Promise<void> {
        if(runtimeEnvironment.value === 'web'){
            await sqliteConnection.saveToStore('mobileChecklistDb');
        }
        else{
            await saveDatabaseToFile();
        }
        return;
    }

    async function runDatabaseUpdates(): Promise<void> {
        await sqlitePlugin.addUpgradeStatement({
            database: 'mobileChecklistDb',
            upgrade: updateStatements,
        });
        return;
    }

    async function saveDatabaseToFile(): Promise<void> {
        if(databaseConnection.value){
            const dbJson = await databaseConnection.value.exportToJson('full', false);
            await Filesystem.writeFile({
                path: 'mobile-checklist/database/database.json',
                data: JSON.stringify(dbJson.export),
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            });
        }
        return;
    }

    async function setDatabaseConnection(): Promise<void> {
        await runDatabaseUpdates();
        databaseConnection.value = await openDatabase();
        return;
    }

    async function setNewestDbVersionNumber(): Promise<void> {
        updateStatements.forEach((statement) => {
            newestDbVersion.value = Number(statement.toVersion);
        });
        return;
    }

    function setRuntimeEnvironment(env: string): void {
        runtimeEnvironment.value = env;
    }

    return {
        createDatabaseConnection,
        createDatabaseJsonFile,
        getDatabaseConnection,
        initWebStore,
        processDatabaseChange,
        setNewestDbVersionNumber,
        setRuntimeEnvironment
    };
});
