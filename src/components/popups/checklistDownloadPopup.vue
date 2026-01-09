<template>
    <q-dialog v-model="displayPopup" full-width full-height>
        <q-card>
            <q-card-section class="q-pa-none row justify-between q-gutter-sm no-wrap">
                <div class="q-py-sm q-pl-sm text-h5 text-bold">Download Checklists</div>
                <div>
                    <q-btn square glossy padding="5px 10px" color="negative" icon="close" @click="closePopup();"></q-btn>
                </div>
            </q-card-section>
            <q-card-section class="scroll">
                <template v-if="checklistDownloadOptionArr.length > 0">
                    <div class="q-pa-md">
                        <q-list bordered separator>
                            <template v-for="checklist in checklistDownloadOptionArr">
                                <q-item tag="label">
                                    <q-item-section>
                                        <q-item-label class="text-bold">{{ checklist.name }}</q-item-label>
                                    </q-item-section>
                                    <q-item-section side top>
                                        <div class="row q-gutter-sm">
                                            <q-btn dense round icon="info" @click="openChecklistInfoPopup(checklist)"></q-btn>
                                            <q-btn dense round icon="download_for_offline" aria-label="Download" @click="installChecklist(checklist)" />
                                        </div>
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-list>
                    </div>
                </template>
                <template v-else>
                    <div class="fit relative-position">
                        <div class="absolute-center text-bold">
                            There are no more checklists available to download from the portal
                        </div>
                    </div>
                </template>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
<script setup lang="ts">
import {computed, onMounted, defineEmits, ref, toRefs, watch, inject} from 'vue';

import {
    hideWorking,
    showNotification,
    showWorking
} from 'src/hooks/core';

import { RemoteChecklistInterface } from 'src/interfaces/RemoteChecklistInterface';

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

const openChecklistInfoPopup: any = inject('openChecklistInfoPopup');

watch(propsRefs.showPopup, () => {
    setDisplayValue();
});

function closePopup() {
    emit('close:popup');
}

async function installChecklist(checklist: RemoteChecklistInterface) {
    showWorking('Initializing download');
    await checklistRemoteStore.installChecklist(checklist, (res: string) => {
        hideWorking();
        if(Number(res) === 1){
            showNotification('positive','Checklist downloaded');
        }
        else{
            showNotification('negative', res);
        }
    });
}
function setDisplayValue() {
    displayPopup.value = props.showPopup;
}

onMounted(() => {
    setDisplayValue();
});
</script>
