<template>
    <router-view />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Capacitor } from '@capacitor/core';
import { JeepSqlite } from 'jeep-sqlite/dist/components/jeep-sqlite';

import { createDirectory, getFolderContents } from 'src/hooks/core';

import { useChecklistStore } from 'stores/checklist';
import { useChecklistRemoteStore } from 'stores/checklist-remote';
import { useDatabaseStore } from 'stores/database';

const portalBaseUrl = 'https://www.cal-ibis.org';

const checklistStore = useChecklistStore();
const checklistRemoteStore = useChecklistRemoteStore();
const databaseStore = useDatabaseStore();

const appInitialized = ref(false);
const appPlatform = Capacitor.getPlatform();
const resetDatabase = ref(false);

async function getDatabaseFileExists(): Promise<boolean> {
    let exists = false;
    const databaseDirContents = await getFolderContents('mobile-checklist/database');
    if(databaseDirContents.files.length > 0){
        const databaseFileObj = databaseDirContents.files.find(obj => obj['name'] === 'database.json' && obj['type'] === 'file');
        if(databaseFileObj){
            exists = true;
        }
    }
    return exists;
}

async function getRootDirectoryExists(): Promise<boolean> {
    let exists = false;
    const dataDirContents = await getFolderContents('');
    if(dataDirContents.files.length > 0){
        const rootDirObj = dataDirContents.files.find(obj => obj['name'] === 'mobile-checklist' && obj['type'] === 'directory');
        if(rootDirObj){
            exists = true;
        }
    }
    return exists;
}

async function getSubDirectoryExists(directoryName: string): Promise<boolean> {
    let exists = false;
    const rootDirContents = await getFolderContents('mobile-checklist');
    if(rootDirContents.files.length > 0){
        const rootDirObj = rootDirContents.files.find(obj => obj['name'] === directoryName && obj['type'] === 'directory');
        if(rootDirObj){
            exists = true;
        }
    }
    return exists;
}

async function initializeApp(platform: string): Promise<boolean> {
    let initialized = false;
    databaseStore.setRuntimeEnvironment(platform);
    if(platform === 'web'){
        await setJeepSQLiteElement();
        await databaseStore.initWebStore();
    }
    const rootValidated = await validateRootDirectory();
    if(rootValidated){
        const subDirectoriesValidated = await validateSubDirectories();
        if(subDirectoriesValidated){
            await databaseStore.setNewestDbVersionNumber();
            const databaseValidated = await validateDatabaseFile(resetDatabase.value);
            if(databaseValidated){
                const databaseConnectionValidated = await databaseStore.createDatabaseConnection();
                if(databaseConnectionValidated){
                    if(resetDatabase.value){
                        initialized = await databaseStore.deleteDatabase();
                    }
                    else{
                        initialized = true;
                    }
                }
            }
        }
    }
    return initialized;
}

async function setJeepSQLiteElement(): Promise<void> {
    customElements.define('jeep-sqlite', JeepSqlite);
    const jeepEl = document.createElement('jeep-sqlite');
    document.body.appendChild(jeepEl);
    customElements.whenDefined('jeep-sqlite')
    .then(() => {
        return;
    });
}

async function validateDatabaseFile(reset = false): Promise<boolean> {
    let validated = await getDatabaseFileExists();
    if(!validated || reset){
        await databaseStore.createDatabaseJsonFile();
        validated = await getDatabaseFileExists();
    }
    return validated;
}

async function validateRootDirectory(): Promise<boolean> {
    let validated = await getRootDirectoryExists();
    if(!validated){
        await createDirectory('mobile-checklist');
        validated = await getRootDirectoryExists();
    }
    return validated;
}

async function validateSubDirectories(): Promise<boolean> {
    let validated = await getSubDirectoryExists('database');
    if(!validated){
        await createDirectory('mobile-checklist/database');
        validated = await getSubDirectoryExists('database');
    }
    if(validated){
        validated = await getSubDirectoryExists('images');
        if(!validated){
            await createDirectory('mobile-checklist/images');
            validated = await getSubDirectoryExists('images');
        }
    }
    return validated;
}

onMounted(async () => {
    appInitialized.value = await initializeApp(appPlatform);
    checklistRemoteStore.setApiBaseUrl(portalBaseUrl);
    checklistRemoteStore.setChecklistArr();
    await checklistStore.setChecklistArr();
});
</script>
