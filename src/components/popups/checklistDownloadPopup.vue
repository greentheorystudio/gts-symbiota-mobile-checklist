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
                                                <q-btn flat dense round icon="download_for_offline" aria-label="Download" @click="installChecklist(checklist);" />
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
import { computed, onMounted, defineEmits, Ref, ref, toRefs, watch } from 'vue';
import { FileInfo } from '@capacitor/filesystem';

import {
    clearDownloadDirectory,
    downloadChecklistDataArchive,
    extractZipFile,
    getFolderContents,
    fileFolderExists,
    hideWorking,
    showNotification,
    showWorking, getFileContents
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
const checklistPackagingServiceApiUrl = computed(() => checklistRemoteStore.getChecklistPackagingServiceApiUrl);
const dataArchiveData: Ref<any> = ref({});
const dataArchiveFiles: Ref<FileInfo[]> = ref([]);
const displayPopup = ref(false);
const downloadAttempt = ref(1);
const newChecklistData: Ref<RemoteChecklistInterface | null> = ref(null);
const propsRefs = toRefs(props);
const remoteChecklistArr = computed(() => checklistRemoteStore.getChecklistArr);

watch(propsRefs.showPopup, () => {
    setDisplayValue();
});

function closePopup() {
    emit('close:popup');
}

async function installChecklist(checklist: any) {
    showWorking('Initializing download');
    newChecklistData.value = Object.assign({}, checklist);
    dataArchiveData.value = Object.assign({}, {});
    dataArchiveFiles.value.length = 0;
    downloadAttempt.value = 1;
    await processDataDownload();
}

async function loadArchiveData() {
    showWorking('Reading data');
    if(await fileFolderExists('mobile-checklist/download/extract/data.json')){
        const dataJsonStr = await getFileContents('mobile-checklist/download/extract/data.json');
        if(dataJsonStr.data && typeof dataJsonStr.data === 'string'){
            const decodedString = atob(dataJsonStr.data);
            dataArchiveData.value = Object.assign({}, JSON.parse(decodedString));
            console.log(dataArchiveData.value);
        }
        else{
            hideWorking();
            showNotification('negative', 'The archive data file is corrupted');
        }
    }
    else{
        hideWorking();
        showNotification('negative', 'The data archive does not contain a data file');
    }
}

async function processDataDownload() {
    if(newChecklistData.value){
        await clearDownloadDirectory();
        const dataArchiveRequestUrl = checklistPackagingServiceApiUrl.value + '?action=getAppChecklistData&clid=' + newChecklistData.value['clid'];
        const dataDownloaded = await downloadChecklistDataArchive(dataArchiveRequestUrl, newChecklistData.value['appconfigjson']['dataArchiveFilename'].toString());
        if(dataDownloaded){
            await processDataExtraction();
        }
        else if(downloadAttempt.value < 4){
            downloadAttempt.value++;
            await processDataDownload();
        }
        else{
            hideWorking();
            showNotification('negative', 'The checklist data is not able to be downloaded at this time');
        }
    }
}

async function processDataExtraction() {
    showWorking('Extracting data');
    if(newChecklistData.value){
        const fullPath = 'mobile-checklist/download/' + newChecklistData.value['appconfigjson']['dataArchiveFilename'].toString();
        const dataExtracted = await extractZipFile(fullPath, 'mobile-checklist/download/extract');
        if(dataExtracted){
            const downloadDirContents = await getFolderContents('mobile-checklist/download/extract');
            if(downloadDirContents.files.length > 0){
                dataArchiveFiles.value = downloadDirContents.files;
                await loadArchiveData();
            }
            else{
                hideWorking();
                showNotification('negative', 'The data archive is empty');
            }
        }
        else{
            hideWorking();
            showNotification('negative', 'There was an error extracting the data');
        }
    }
}

function setDisplayValue() {
    displayPopup.value = props.showPopup;
}

onMounted(() => {
    setDisplayValue();
});
</script>
