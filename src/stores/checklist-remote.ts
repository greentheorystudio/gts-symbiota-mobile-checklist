import { ComputedRef, ref, Ref, computed } from 'vue';
import { defineStore } from 'pinia';
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
    moveFile,
    showWorking
} from 'src/hooks/core';

import { useChecklistStore } from 'src/stores/checklist';
import { useDatabaseStore } from 'stores/database';

import { ChecklistImageInterface } from 'src/interfaces/ChecklistImageInterface';
import { ChecklistMapImageInterface } from 'src/interfaces/ChecklistMapImageInterface';
import { ChecklistTaxonInterface } from 'src/interfaces/ChecklistTaxonInterface';
import { RemoteChecklistInterface } from 'src/interfaces/RemoteChecklistInterface';
import { ChecklistInterface } from "src/interfaces/ChecklistInterface";

export const useChecklistRemoteStore = defineStore('checklist-remote', () => {
    const checklistStore = useChecklistStore();
    const databaseStore = useDatabaseStore();

    const apiBaseUrl: Ref<string|null> = ref(null);
    const checklistArr: Ref<RemoteChecklistInterface[]> = ref([]);
    const dataArchiveData: Ref<any> = ref({});
    const dataArchiveFiles: Ref<FileInfo[]> = ref([]);
    const downloadAttempt = ref(1);
    const newChecklistData: Ref<RemoteChecklistInterface | null> = ref(null);
    const newChecklistImageData: Ref<ChecklistImageInterface[]> = ref([]);
    const newChecklistKeyData: Ref<any> = ref({});
    const newChecklistMapImageData: Ref<ChecklistMapImageInterface[]> = ref([]);
    const newChecklistTaxaData: Ref<ChecklistTaxonInterface[]> = ref([]);
    const platform = computed(() => databaseStore.getRuntimeEnvironment);
    const remoteConnectionEstablished = ref(true);

    const getChecklistApiUrl: ComputedRef<string> = computed(() => {
        return apiBaseUrl.value + '/api/checklists/checklistController.php';
    });
    const getChecklistArr = computed(() => {
        return checklistArr.value;
    });
    const getChecklistPackagingServiceApiUrl: ComputedRef<string> = computed(() => {
        return apiBaseUrl.value + '/api/services/checklistPackagingServiceController.php';
    });
    const getRemoteConnectionEstablished = computed(() => {
        return remoteConnectionEstablished.value;
    });

    async function installChecklist(checklist: RemoteChecklistInterface, callback: any) {
        newChecklistData.value = Object.assign({}, checklist);
        newChecklistImageData.value.length = 0;
        newChecklistMapImageData.value.length = 0;
        newChecklistKeyData.value = Object.assign({}, checklist);
        newChecklistTaxaData.value.length = 0;
        dataArchiveData.value = Object.assign({}, {});
        dataArchiveFiles.value.length = 0;
        downloadAttempt.value = 1;
        await checklistStore.deleteChecklist(newChecklistData.value['clid']);
        await processDataDownload(callback);
    }

    async function loadArchiveData(callback: any) {
        showWorking('Reading data');
        if(await fileFolderExists('mobile-checklist/download/extract/data.json')){
            const dataJsonStr = await getFileContents('mobile-checklist/download/extract/data.json');
            if(dataJsonStr.data && typeof dataJsonStr.data === 'string'){
                let decodedString = dataJsonStr.data;
                if(platform.value && platform.value === 'web'){
                    decodedString = atob(dataJsonStr.data);
                }
                dataArchiveData.value = Object.assign({}, JSON.parse(decodedString));
                if(dataArchiveData.value.hasOwnProperty('taxa') && dataArchiveData.value['taxa'].length > 0){
                    await processImageFiles(callback);
                }
                else{
                    callback('The data does not contain taxa');
                }
            }
            else{
                callback('The archive data file is corrupted');
            }
        }
        else{
            callback('The data archive does not contain a data file');
        }
    }

    async function processDataDownload(callback: any) {
        if(newChecklistData.value){
            await clearDownloadDirectory();
            const dataArchiveRequestUrl = getChecklistPackagingServiceApiUrl.value + '?action=getAppChecklistData&clid=' + newChecklistData.value['clid'];
            const dataDownloaded = await downloadChecklistDataArchive(dataArchiveRequestUrl, newChecklistData.value['appconfigjson']['dataArchiveFilename'].toString());
            if(dataDownloaded){
                await processDataExtraction(callback);
            }
            else if(downloadAttempt.value < 4){
                downloadAttempt.value++;
                await processDataDownload(callback);
            }
            else{
                callback('The checklist data is not able to be downloaded at this time');
            }
        }
    }

    async function processDataExtraction(callback: any) {
        showWorking('Extracting data');
        if(newChecklistData.value){
            const fullPath = 'mobile-checklist/download/' + newChecklistData.value['appconfigjson']['dataArchiveFilename'].toString();
            const dataExtracted = await extractZipFile(fullPath, 'mobile-checklist/download/extract');
            if(dataExtracted){
                await deleteFile(fullPath);
                const downloadDirContents = await getFolderContents('mobile-checklist/download/extract');
                if(downloadDirContents.files.length > 0){
                    dataArchiveFiles.value = downloadDirContents.files;
                    await loadArchiveData(callback);
                }
                else{
                    callback('The data archive is empty');
                }
            }
            else{
                callback('There was an error extracting the data');
            }
        }
    }

    async function processImageFiles(callback: any) {
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
                await processMapImageFiles(callback);
            }
        }
        else{
            await processMapImageFiles(callback);
        }
    }

    async function processImport(callback: any) {
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
            const res = await checklistStore.createChecklist(checklistData, newChecklistImageData.value, newChecklistMapImageData.value, newChecklistTaxaData.value, newChecklistKeyData.value);
            await clearDownloadDirectory();
            if(res){
                callback('1');
            }
            else{
                callback('There was an error importing the data');
            }
        }
    }

    async function processKeyData(callback: any) {
        showWorking('Processing identification data');
        const clidVal = newChecklistData.value ? newChecklistData.value['clid'].toString() : null;
        if(clidVal){
            newChecklistKeyData.value['character-states'] = (dataArchiveData.value.hasOwnProperty('character-states') && dataArchiveData.value['character-states']) ? JSON.stringify(dataArchiveData.value['character-states']) : null;
            newChecklistKeyData.value['characters'] = (dataArchiveData.value.hasOwnProperty('characters') && dataArchiveData.value['characters']) ? JSON.stringify(dataArchiveData.value['characters']) : null;
            newChecklistKeyData.value['character-headings'] = (dataArchiveData.value.hasOwnProperty('character-headings') && dataArchiveData.value['character-headings']) ? JSON.stringify(dataArchiveData.value['character-headings']) : null;
        }
        await processImport(callback);
    }

    async function processMapImageFiles(callback: any) {
        if(newChecklistData.value && dataArchiveFiles.value.length > 1 && dataArchiveData.value.hasOwnProperty('map-images') && dataArchiveData.value['map-images'].length > 0){
            showWorking('Processing map image files');
            const clidVal = newChecklistData.value ? newChecklistData.value['clid'].toString() : null;
            if(clidVal){
                if(!await fileFolderExists('mobile-checklist/images/' + clidVal)){
                    await createDirectory('mobile-checklist/images/' + clidVal);
                }
                for(const image of dataArchiveData.value['map-images']) {
                    const fullPath = 'mobile-checklist/download/extract/' + image['filename'];
                    const targetPath = 'mobile-checklist/images/' + clidVal + '/' + image['filename'];
                    if(await moveFile(fullPath, targetPath)){
                        newChecklistMapImageData.value.push({
                            clid: Number(clidVal),
                            tid: image['tid'],
                            title: image['title'],
                            filePath: targetPath
                        });
                    }
                }
                await processTaxaData(callback);
            }
        }
        else{
            await processTaxaData(callback);
        }
    }

    async function processTaxaData(callback: any) {
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
                    habitat: taxon['habitat'],
                    notes: taxon['notes'],
                    abundance: taxon['abundance'],
                    descriptionJson: taxon.hasOwnProperty('descData') ? JSON.stringify(taxon['descData']) : '',
                    keyJson: taxon.hasOwnProperty('keyData') ? JSON.stringify(taxon['keyData']) : '',
                    synonymyJson: taxon.hasOwnProperty('synonymyData') ? JSON.stringify(taxon['synonymyData']) : '',
                    vernacularJson: taxon.hasOwnProperty('vernacularData') ? JSON.stringify(taxon['vernacularData']) : ''
                });
            });
            await processKeyData(callback);
        }
    }

    function setApiBaseUrl(url: string): void {
        apiBaseUrl.value = url;
    }

    function setChecklistArr(): void {
        const formData = new FormData();
        formData.append('action', 'getAppChecklistArr');
        fetch(getChecklistApiUrl.value, {
            method: 'POST',
            body: formData
        })
        .then((response) => {
            return response.ok ? response.json() : null;
        })
        .then((resData) => {
            if(resData && resData.length > 0){
                checklistArr.value = resData;
            }
        })
        .catch(error => {
            remoteConnectionEstablished.value = false;
        });
    }

    return {
        getChecklistArr,
        getChecklistPackagingServiceApiUrl,
        getRemoteConnectionEstablished,
        installChecklist,
        setApiBaseUrl,
        setChecklistArr
    };
});
