<template>
    <q-page>
        <template v-if="Number(checklistId) > 0">
            <div class="fit">
                <q-page-sticky position="left" :offset="[-5, 0]" @click="toggleLeftDrawer">
                    <q-btn square padding="25px 0" color="primary" icon="arrow_right"></q-btn>
                </q-page-sticky>
                <div>

                </div>
            </div>
        </template>
        <template v-else>
            <div class="fit flex flex-center">
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
            </div>
        </template>
    </q-page>
</template>
<script setup lang="ts">
import { computed, inject } from 'vue';

import { useChecklistStore } from 'src/stores/checklist';
import { useChecklistRemoteStore } from 'src/stores/checklist-remote';

const checklistStore = useChecklistStore();
const checklistRemoteStore = useChecklistRemoteStore();

const checklistArr = computed(() => checklistStore.getChecklistArr);
const checklistId = computed(() => checklistStore.getChecklistId);
const remoteChecklistArr = computed(() => checklistRemoteStore.getChecklistArr);
const remoteConnectionEstablished = computed(() => checklistRemoteStore.getRemoteConnectionEstablished);

const toggleLeftDrawer: any = inject('toggleLeftDrawer');
</script>
