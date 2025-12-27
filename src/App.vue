<template>
    <router-view />
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { Capacitor } from '@capacitor/core';

import AppInitializationService from './services/appInitializationService';
import DatabaseService from './services/databaseService';

import { useChecklistStore } from 'src/stores/checklist';
import { useChecklistRemoteStore } from 'src/stores/checklist-remote';

const portalBaseUrl = 'https://www.cal-ibis.org';

const databaseService = new DatabaseService();
const appInitializationService = new AppInitializationService(databaseService);

const checklistStore = useChecklistStore();
const checklistRemoteStore = useChecklistRemoteStore();

const appInitialized = ref(false);
const appPlatform = Capacitor.getPlatform();
const databaseConnection = computed(() => {
    return databaseService.getDatabaseConnection();
});
const resetDatabase = ref(false);

onMounted(async () => {
    appInitialized.value = await appInitializationService.initializeApp(appPlatform, resetDatabase.value);
    checklistStore.setDatabaseConnection(databaseConnection.value);
    checklistRemoteStore.setApiBaseUrl(portalBaseUrl);
    checklistRemoteStore.setChecklistArr();
    await checklistStore.setChecklistArr();
});
</script>
