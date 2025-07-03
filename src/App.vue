<template>
    <router-view />
</template>

<script lang="ts">
import { computed, defineComponent, ref, onMounted, provide } from 'vue';
import { Capacitor } from '@capacitor/core';

import AppInitializationService from './services/appInitializationService';
import DatabaseService from './services/databaseService';

import { useChecklistAdminStore } from 'src/stores/checklist-admin';
import { useChecklistDisplayStore } from 'src/stores/checklist-display';
import { useChecklistRemoteStore } from 'src/stores/checklist-remote';

const databaseService = new DatabaseService();
const appInitializationService = new AppInitializationService(databaseService);

export default defineComponent({
    name: 'App',
    setup() {
        const checklistAdminStore = useChecklistAdminStore();
        const checklistDisplayStore = useChecklistDisplayStore();
        const checklistRemoteStore = useChecklistRemoteStore();

        const appInitialized = ref(false);
        const appPlatform = Capacitor.getPlatform();
        const databaseConnection = computed(() => {
            return databaseService.getDatabaseConnection();
        });

        provide('checklistAdminStore', checklistAdminStore);
        provide('checklistDisplayStore', checklistDisplayStore);
        provide('checklistRemoteStore', checklistRemoteStore);

        onMounted(async () => {
            appInitialized.value = await appInitializationService.initializeApp(appPlatform);
            checklistAdminStore.setDatabaseConnection(databaseConnection.value);
            checklistDisplayStore.setDatabaseConnection(databaseConnection.value);
            checklistRemoteStore.setChecklistArr();
            await checklistDisplayStore.setChecklistArr();
        });

        return {

        };
    }
});
</script>
