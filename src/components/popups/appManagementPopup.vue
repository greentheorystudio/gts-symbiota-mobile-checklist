<template>
    <q-dialog v-model="displayPopup" full-width full-height>
        <q-card>
            <q-card-section class="q-pa-none row justify-between q-gutter-sm no-wrap">
                <div class="q-py-sm q-pl-md text-h5 text-bold">Management</div>
                <div>
                    <q-btn square glossy padding="5px 10px" color="negative" icon="close" @click="closePopup();"></q-btn>
                </div>
            </q-card-section>
            <q-card-section class="scroll">
                <div class="q-mt-md column q-gutter-md">
                    <template v-if="checklistArr.length > 0">
                        <q-list bordered separator>
                            <template v-for="checklist in checklistArr">
                                <q-item tag="label">
                                    <q-item-section>
                                        <q-item-label class="text-bold">{{ checklist.name }}</q-item-label>
                                        <q-item-label v-if="getUpdateAvailable(checklist)" caption class="text-red">Update available</q-item-label>
                                    </q-item-section>
                                    <q-item-section side top>
                                        <div class="row q-gutter-sm">
                                            <q-btn v-if="getUpdateAvailable(checklist)" dense round icon="update" aria-label="Update" @click="updateChecklist(checklist)" />
                                            <q-btn dense round icon="delete" aria-label="Delete" @click="deleteChecklist(checklist.clid)" />
                                        </div>
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-list>
                    </template>
                    <div class="row justify-end">
                        <q-btn color="negative" glossy @click="resetApp()" label="Reset App" />
                    </div>
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
    <confirmationPopup ref="confirmationPopupRef"></confirmationPopup>
</template>
<script setup lang="ts">
import {onMounted, defineEmits, ref, toRefs, watch, computed} from 'vue';

import {
    hideWorking,
    showNotification,
    showWorking
} from 'src/hooks/core';

import { useChecklistStore } from 'src/stores/checklist';
import { useChecklistRemoteStore } from 'src/stores/checklist-remote';

import confirmationPopup from 'src/components/input-elements/confirmationPopup.vue';

const checklistStore = useChecklistStore();
const checklistRemoteStore = useChecklistRemoteStore();

const props = defineProps({
    showPopup: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close:popup']);

const checklistArr = computed(() => checklistStore.getChecklistArr);
const checklistId = computed(() => checklistStore.getChecklistId);
const confirmationPopupRef: any = ref(null);
const displayPopup = ref(false);
const propsRefs = toRefs(props);
const remoteChecklistArr = computed(() => checklistRemoteStore.getChecklistArr);

watch(propsRefs.showPopup, () => {
    setDisplayValue();
});

function closePopup() {
    emit('close:popup');
}

function deleteChecklist(clid: number) {
    const confirmText = 'Are you sure you want to delete this checklist?';
    if(confirmationPopupRef.value){
        confirmationPopupRef.value.openPopup(confirmText, {cancel: true, falseText: 'Cancel', trueText: 'Yes', callback: (val: boolean) => {
            if(val){
                processDelete(clid);
            }
        }});
    }
}

function getUpdateAvailable(checklist: any) {
    let returnVal = false;
    const remoteObj = remoteChecklistArr.value.find(rchecklist => Number(rchecklist.clid) === Number(checklist.clid));
    if(remoteObj && Number(remoteObj.appconfigjson.datePublished) > Number(checklist.publishtimestamp)){
        returnVal = true;
    }
    return returnVal;
}

async function processDelete(clid: number) {
    const res: any = await checklistStore.deleteChecklist(clid);
    if(res.hasOwnProperty('changes') && res.changes.hasOwnProperty('changes') && Number(res.changes.changes) === 1) {
        showNotification('positive','Checklist deleted');
    }
    else{
        showNotification('negative', 'There was an error while deleting this checklist');
    }
}

function resetApp() {
    const confirmText = 'This will delete all data that has been downloaded and cannot be undone. Are you sure you want to delete this checklist?';
    if(confirmationPopupRef.value){
        confirmationPopupRef.value.openPopup(confirmText, {cancel: true, falseText: 'Cancel', trueText: 'Yes', callback: (val: boolean) => {
                if(val){

                }
            }});
    }
}

function setDisplayValue() {
    displayPopup.value = props.showPopup;
}

async function updateChecklist(checklist: any) {
    const setCurrent = Number(checklistId.value) === Number(checklist.clid);
    const remoteObj = remoteChecklistArr.value.find(rchecklist => Number(rchecklist.clid) === Number(checklist.clid));
    if(remoteObj){
        showWorking('Updating checklist');
        await checklistRemoteStore.installChecklist(remoteObj, (res: string) => {
            hideWorking();
            if(Number(res) === 1){
                if(setCurrent){
                    checklistStore.setCurrentChecklist(checklist.clid);
                }
                showNotification('positive','Update successful');
            }
            else{
                showNotification('negative', res);
            }
        });
    }
}

onMounted(() => {
    setDisplayValue();
});
</script>
