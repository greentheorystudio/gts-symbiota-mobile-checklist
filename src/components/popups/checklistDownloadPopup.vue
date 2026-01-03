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
    createDirectory,
    deleteFile,
    downloadChecklistDataArchive,
    extractZipFile,
    fileFolderExists,
    getFileContents,
    getFolderContents,
    hideWorking,
    moveFile,
    showNotification,
    showWorking
} from 'src/hooks/core';

import { ChecklistInterface } from 'src/interfaces/ChecklistInterface';
import { ChecklistImageInterface } from 'src/interfaces/ChecklistImageInterface';
import { ChecklistTaxonInterface } from 'src/interfaces/ChecklistTaxonInterface';
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
const newChecklistImageData: Ref<ChecklistImageInterface[]> = ref([]);
const newChecklistKeyData: Ref<any> = ref({});
const newChecklistTaxaData: Ref<ChecklistTaxonInterface[]> = ref([]);
const propsRefs = toRefs(props);
const remoteChecklistArr = computed(() => checklistRemoteStore.getChecklistArr);

watch(propsRefs.showPopup, () => {
    setDisplayValue();
});

function closePopup() {
    emit('close:popup');
}

async function installChecklist(checklist: RemoteChecklistInterface) {
    showWorking('Initializing download');
    newChecklistData.value = Object.assign({}, checklist);
    newChecklistImageData.value.length = 0;
    newChecklistKeyData.value = Object.assign({}, checklist);
    newChecklistTaxaData.value.length = 0;
    dataArchiveData.value = Object.assign({}, {});
    dataArchiveFiles.value.length = 0;
    downloadAttempt.value = 1;
    await checklistStore.deleteChecklist(newChecklistData.value['clid']);
    await processDataDownload();
}

async function loadArchiveData() {
    showWorking('Reading data');
    if(await fileFolderExists('mobile-checklist/download/extract/data.json')){
        const dataJsonStr = await getFileContents('mobile-checklist/download/extract/data.json');
        if(dataJsonStr.data && typeof dataJsonStr.data === 'string'){
            const decodedString = atob(dataJsonStr.data);
            dataArchiveData.value = Object.assign({}, JSON.parse(decodedString));
            if(dataArchiveData.value.hasOwnProperty('taxa') && dataArchiveData.value['taxa'].length > 0){
                await processImageFiles();
            }
            else{
                hideWorking();
                showNotification('negative', 'The data does not contain taxa');
            }
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
            await deleteFile(fullPath);
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

async function processImageFiles() {
    if(newChecklistData.value && dataArchiveFiles.value.length > 1 && dataArchiveData.value.hasOwnProperty('images') && dataArchiveData.value['images'].length > 0){
        showWorking('Processing image files');
        const clidVal = newChecklistData.value ? newChecklistData.value['clid'].toString() : null;
        if(clidVal){
            await createDirectory('mobile-checklist/images/' + clidVal);
            for(const image of dataArchiveData.value['images']) {
                const fullPath = 'mobile-checklist/download/extract/' + image['filename'];
                const targetPath = 'mobile-checklist/images/' + clidVal + '/' + image['filename'];
                if(await moveFile(fullPath, targetPath)){
                    newChecklistImageData.value.push({
                        clid: Number(clidVal),
                        tid: image['tid'],
                        photographer: image['photographer'],
                        owner: image['owner'],
                        filePath: targetPath
                    });
                }
            }
            await processTaxaData();
        }
    }
    else{
        await processTaxaData();
    }
}

async function processImport() {
    if(newChecklistData.value){
        showWorking('Importing checklist');
        const checklistData: ChecklistInterface = {
            clid: Number(newChecklistData.value['clid']),
            name: newChecklistData.value['name'],
            title: newChecklistData.value['title'],
            locality: newChecklistData.value['locality'],
            publication: newChecklistData.value['publication'],
            abstract: newChecklistData.value['abstract'],
            authors: newChecklistData.value['authors'],
            notes: newChecklistData.value['notes'],
            defaultSettings: newChecklistData.value['defaultsettings'] ? JSON.stringify(newChecklistData.value['defaultsettings']) : null,
            publishtimestamp: newChecklistData.value['appconfigjson']['datePublished']
        };
        const res = await checklistStore.createChecklist(checklistData, newChecklistImageData.value, newChecklistTaxaData.value, newChecklistKeyData.value);
        hideWorking();
        if(res){
            showNotification('positive','Checklist downloaded');
        }
        else{
            showNotification('negative', 'There was an error importing the data');
        }
    }
}

async function processKeyData() {
    showWorking('Processing identification data');
    const clidVal = newChecklistData.value ? newChecklistData.value['clid'].toString() : null;
    if(clidVal){
        newChecklistKeyData.value['character-states'] = (dataArchiveData.value.hasOwnProperty('character-states') && dataArchiveData.value['character-states']) ? JSON.stringify(dataArchiveData.value['character-states']) : null;
        newChecklistKeyData.value['characters'] = (dataArchiveData.value.hasOwnProperty('characters') && dataArchiveData.value['characters']) ? JSON.stringify(dataArchiveData.value['characters']) : null;
        newChecklistKeyData.value['character-headings'] = (dataArchiveData.value.hasOwnProperty('character-headings') && dataArchiveData.value['character-headings']) ? JSON.stringify(dataArchiveData.value['character-headings']) : null;
    }
    await processImport();
}

async function processTaxaData() {
    showWorking('Processing taxa');
    const clidVal = newChecklistData.value ? newChecklistData.value['clid'].toString() : null;
    if(clidVal){
        dataArchiveData.value['taxa'].forEach((taxon: any) => {
            newChecklistTaxaData.value.push({
                clid: Number(clidVal),
                tid: taxon['tid'],
                rankid: taxon['rankid'],
                sciname: taxon['sciname'],
                author: taxon['author'],
                family: taxon['family'],
                descriptionJson: taxon.hasOwnProperty('descData') ? JSON.stringify(taxon['descData']) : '',
                keyJson: taxon.hasOwnProperty('keyData') ? JSON.stringify(taxon['keyData']) : '',
                synonymyJson: taxon.hasOwnProperty('synonymyData') ? JSON.stringify(taxon['synonymyData']) : '',
                vernacularJson: taxon.hasOwnProperty('vernacularData') ? JSON.stringify(taxon['vernacularData']) : ''
            });
        });
        await processKeyData();
    }
}

function setDisplayValue() {
    displayPopup.value = props.showPopup;
}

onMounted(() => {
    setDisplayValue();
});
</script>
