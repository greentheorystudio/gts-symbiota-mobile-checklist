<template>
    <router-view />
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { Capacitor } from '@capacitor/core';

import AppInitializationService from './services/appInitializationService';
import DatabaseService from './services/databaseService';

import { useChecklistAdminStore } from 'src/stores/checklist-admin';
import { useChecklistDisplayStore } from 'src/stores/checklist-display';
import { useChecklistRemoteStore } from 'src/stores/checklist-remote';

const databaseService = new DatabaseService();
const appInitializationService = new AppInitializationService(databaseService);

const checklistAdminStore = useChecklistAdminStore();
const checklistDisplayStore = useChecklistDisplayStore();
const checklistRemoteStore = useChecklistRemoteStore();

const appInitialized = ref(false);
const appPlatform = Capacitor.getPlatform();
const databaseConnection = computed(() => {
    return databaseService.getDatabaseConnection();
});
const resetDatabase = ref(true);

onMounted(async () => {
    appInitialized.value = await appInitializationService.initializeApp(appPlatform, resetDatabase.value);
    checklistAdminStore.setDatabaseConnection(databaseConnection.value);
    checklistDisplayStore.setDatabaseConnection(databaseConnection.value);
    checklistRemoteStore.setChecklistArr();
    await checklistDisplayStore.setChecklistArr();
});
</script>
