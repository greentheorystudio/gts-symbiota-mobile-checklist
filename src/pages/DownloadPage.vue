<template>
    <q-page>
        <div class="q-pa-md">
            <template v-if="checklistDownloadOptionArr.length > 0">
                <q-list>
                    <template v-for="checklist in checklistDownloadOptionArr">
                        <template v-if="checklist.name">
                            <q-item>
                                <q-item-section>
                                    <div class="row justify-start q-gutter-md items-center">
                                        <div class="text-h6">
                                            {{ checklist.name }}
                                        </div>
                                        <q-btn flat dense round icon="download_for_offline" aria-label="Download" to="download" />
                                    </div>
                                </q-item-section>
                            </q-item>
                        </template>
                    </template>
                </q-list>
            </template>
            <template v-else>
                <div class="flex flex-center text-h6 text-bold">
                    There are no checklists available to download from the portal
                </div>
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
const checklistDownloadOptionArr = computed(() => {
    const returnArr: any[] = [];
    remoteChecklistArr.value.forEach((checklist) => {
        const existingChecklist = checklistArr.value.find(eChecklist => Number(eChecklist['clid']) === Number(checklist.value['clid']));
        if(!existingChecklist){
            returnArr.push(checklist);
        }
    });
    return returnArr;
});
const remoteChecklistArr = computed(() => checklistRemoteStore.getChecklistArr);
</script>
