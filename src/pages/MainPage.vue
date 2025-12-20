<template>
    <q-page class="flex flex-center">
        <div class="text-h6 text-bold">
            <template v-if="checklistArr.length > 0">
                <div>Select a checklist from the dropdown above to view</div>
            </template>
            <template v-else-if="remoteChecklistArr.length > 0">
                <div>Tap the Download button in the top right corner to download checklists to your device</div>
            </template>
            <template v-else-if="!remoteConnectionEstablished">
                <div>Out of internet connection</div>
            </template>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useChecklistDisplayStore } from 'src/stores/checklist-display';
import { useChecklistRemoteStore } from 'src/stores/checklist-remote';

const checklistDisplayStore = useChecklistDisplayStore();
const checklistRemoteStore = useChecklistRemoteStore();

const checklistArr = computed(() => checklistDisplayStore.getChecklistArr);
const remoteChecklistArr = computed(() => checklistRemoteStore.getChecklistArr);
const remoteConnectionEstablished = computed(() => checklistRemoteStore.getRemoteConnectionEstablished);
</script>
