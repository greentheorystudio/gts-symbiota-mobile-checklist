<template>
    <q-page>
        <div class="q-pa-md">
            <template v-if="checklistDownloadOptionArr.length > 0">

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
    console.log(remoteChecklistArr.value);
    const returnArr: any[] = [];
    remoteChecklistArr.value.forEach((checklist) => {

    });
    return returnArr;
});
const remoteChecklistArr = computed(() => checklistRemoteStore.getChecklistArr);
</script>
