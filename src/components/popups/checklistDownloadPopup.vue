<template>
    <q-dialog v-model="displayPopup" full-width full-height>
        <q-card>
            <q-card-section class="q-pa-sm row justify-between q-gutter-sm">
                <div class="q-pl-sm text-h4 text-bold">Download Checklists</div>
                <q-btn class="text-bold" glossy color="negative" label="Close" @click="closePopup();"></q-btn>
            </q-card-section>
            <q-card-section class="scroll">
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
                                                <q-btn flat dense round icon="download_for_offline" aria-label="Download" to="download" @click="processDownload(checklist);" />
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
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, defineEmits, ref, toRefs, watch } from 'vue';

import { useChecklistStore } from 'src/stores/checklist';
import { useChecklistRemoteStore } from 'src/stores/checklist-remote';

const props = defineProps({
    showPopup: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close:popup']);

const checklistStore = useChecklistStore();
const checklistRemoteStore = useChecklistRemoteStore();

const checklistArr = computed(() => checklistStore.getChecklistArr);
const checklistDownloadOptionArr = computed(() => {
    const returnArr: any[] = [];
    remoteChecklistArr.value.forEach((checklist) => {
        const existingChecklist = checklistArr.value.find(eChecklist => Number(eChecklist['clid']) === Number(checklist['clid']));
        if(!existingChecklist){
            returnArr.push(checklist);
        }
    });
    return returnArr;
});
const displayPopup = ref(false);
const propsRefs = toRefs(props);
const remoteChecklistArr = computed(() => checklistRemoteStore.getChecklistArr);

watch(propsRefs.showPopup, () => {
    setDisplayValue();
});

function closePopup() {
    emit('close:popup');
}

function setDisplayValue() {
    displayPopup.value = props.showPopup;
}

async function processDownload(checklist: any) {
    await checklistStore.createChecklist(checklist);
}

onMounted(() => {
    setDisplayValue();
});
</script>
