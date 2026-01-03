import {
    CapacitorSQLite,
    SQLiteConnection,
    SQLiteDBConnection
} from '@capacitor-community/sqlite';
import { defineStore } from 'pinia';
import { ComputedRef, ref, Ref, computed } from 'vue';

import {
    deleteFile,
    fileFolderExists,
    getFileContents, moveFile,
    writeFile
} from 'src/hooks/core';

import { DatabaseSchemaStatements } from 'src/updates/database.schema';
import { DatabaseUpdateStatements } from '../updates/database.statements';

export const useDatabaseStore = defineStore('database', () => {

    const databaseConnection: Ref<SQLiteDBConnection | undefined> = ref(undefined);
    const newestDbVersion = ref(0);
    const runtimeEnvironment: Ref<string | null> = ref(null);
    const schemaSetupStatements = DatabaseSchemaStatements;
    const sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    const sqlitePlugin = CapacitorSQLite;
    const updateStatements = DatabaseUpdateStatements;

    const getDatabaseConnection: ComputedRef<SQLiteDBConnection | undefined> = computed(() => {
        return databaseConnection.value;
    });

    async function createDatabaseConnection(): Promise<boolean> {
        let connectionEstablished = false;
        const databaseJsonStr = await getFileContents('mobile-checklist/database/database.json');
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
        databaseConnection.value = await openDatabase();
        if(databaseConnection.value){
            for(const statement of schemaSetupStatements) {
                await databaseConnection.value.execute(statement);
            }
            await processDatabaseChange();
            await databaseConnection.value.close()
        }
        return;
    }

    async function deleteDatabase(): Promise<void> {
        await deleteFile('mobile-checklist/database/database.json');
        await CapacitorSQLite.deleteDatabase({
            database: 'mobileChecklistDb'
        });
        return;
    }

    async function initializeDatabase(): Promise<boolean> {
        await setNewestDbVersionNumber();
        const databaseValidated = await validateDatabaseFile();
        if(databaseValidated){
            const databaseConnectionValidated = await createDatabaseConnection();
            if(databaseConnectionValidated){
                return true;
            }
        }
        return false;
    }

    async function initWebStore(): Promise<void> {
        await sqliteConnection.initWebStore();
        return;
    }

    async function openDatabase(): Promise<SQLiteDBConnection | undefined> {
        const db = await sqliteConnection.createConnection(
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
        await saveDatabaseToFile();
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
            await writeFile('mobile-checklist/database/database.json', JSON.stringify(dbJson.export));
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

    async function validateDatabaseFile(): Promise<boolean> {
        let validated = await fileFolderExists('mobile-checklist/database/database.json');
        if(!validated){
            await createDatabaseJsonFile();
            validated = await fileFolderExists('mobile-checklist/database/database.json');
        }
        return validated;
    }

    return {
        createDatabaseConnection,
        createDatabaseJsonFile,
        deleteDatabase,
        getDatabaseConnection,
        initializeDatabase,
        initWebStore,
        processDatabaseChange,
        setNewestDbVersionNumber,
        setRuntimeEnvironment
    };
});
