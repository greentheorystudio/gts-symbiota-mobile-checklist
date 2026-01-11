import { capSQLiteChanges } from '@capacitor-community/sqlite';
import { defineStore } from 'pinia';
import { computed, ref, Ref } from 'vue';

import { deleteChecklistImageDirectory, getImageBase64UriStr } from 'src/hooks/core';

import CharacterHeadings from 'src/models/CharacterHeadings';
import CharacterStates from 'src/models/CharacterStates';
import Characters from 'src/models/Characters';
import ChecklistImages from 'src/models/ChecklistImages';
import Checklists from './../models/Checklists';
import ChecklistTaxa from 'src/models/ChecklistTaxa';

import { ChecklistImageInterface } from 'src/interfaces/ChecklistImageInterface';
import { ChecklistInterface } from 'src/interfaces/ChecklistInterface';
import { ChecklistTaxonInterface } from 'src/interfaces/ChecklistTaxonInterface';

import { useDatabaseStore } from 'stores/database';

export const useChecklistStore = defineStore('checklist', () => {
    const databaseStore = useDatabaseStore();

    const characterModel = new Characters;
    const characterHeadingModel = new CharacterHeadings;
    const characterStateModel = new CharacterStates;
    const checklistImageModel = new ChecklistImages;
    const checklistModel = new Checklists;
    const checklistTaxonModel = new ChecklistTaxa;

    const activeCidArr: Ref<any[]> = ref([]);
    const characterDependencyDataArr: Ref<any[]> = ref([]);
    const checklistArr: Ref<ChecklistInterface[]> = ref([]);
    const checklistCharacterData: Ref<any> = ref([]);
    const checklistCharacterHeadingData: Ref<any> = ref([]);
    const checklistCharacterStateData: Ref<any> = ref([]);
    const checklistData: Ref<ChecklistInterface | null> = ref(null);
    const checklistFlashcardTaxaArr: Ref<any[]> = ref([]);
    const checklistFlashcardTidArr: Ref<any[]> = ref([]);
    const checklistId: Ref<number> = ref(0);
    const checklistImageData: Ref<any> = ref({});
    const checklistKeyDataArr: Ref<any[]> = ref([]);
    const checklistTaxaArr: Ref<ChecklistTaxonInterface[]> = ref([]);
    const displayAuthors: Ref<boolean> = ref(false);
    const displayImages: Ref<boolean> = ref(false);
    const displayNotes: Ref<boolean> = ref(false);
    const displaySortVal: Ref<string> = ref('family');
    const displaySynonyms: Ref<boolean> = ref(false);
    const displayTaxonFilterVal: Ref<any | null> = ref(null);
    const displayVernaculars: Ref<boolean> = ref(false);
    const imageContentData: Ref<any> = ref({});
    const flashcardImageContentData: Ref<any> = ref({});
    const paginationPage: Ref<number> = ref(1);
    const selectedStateArr: Ref<any[]> = ref([]);
    const taxaFilterOptions: Ref<any[]> = ref([]);
    const taxaPerPage = 100;

    const getActiveChidArr = computed(() => {
        const valArr: any[] = [];
        checklistKeyDataArr.value.forEach(heading => {
            if(!heading['characterArr'].every((character: any) => !activeCidArr.value.includes(Number(character['cid'])))){
                valArr.push(Number(heading['chid']));
            }
        });
        return valArr;
    });
    const getActiveCidArr = computed(() => activeCidArr.value);
    const getActiveTaxaArr = computed(() => {
        const returnArr: any[] = [];
        checklistTaxaArr.value.forEach(taxon => {
            const cidArr: any[] = [];
            let includeTaxon = false;
            let keyIncludeTaxon = false;
            const keyData: any = (taxon.hasOwnProperty('keyJson') && taxon['keyJson']) ? JSON.parse(taxon['keyJson']) : null;
            if(keyData){
                Object.keys(keyData).forEach(cid => {
                    if(!keyIncludeTaxon){
                        keyData[cid].forEach((char: { [x: string]: any; }) => {
                            if(!keyIncludeTaxon && (getSelectedCidArr.value.length === 0 || (getSelectedCidArr.value.includes(Number(char['cid'])) && getSelectedCsidArr.value.includes(Number(char['csid']))))){
                                keyIncludeTaxon = true;
                            }
                            if(keyIncludeTaxon && !cidArr.includes(Number(char['cid']))){
                                cidArr.push(Number(char['cid']));
                            }
                        });
                    }
                });
            }
            else{
                keyIncludeTaxon = true;
            }
            getSelectedCidArr.value.forEach(cid => {
                if(!cidArr.includes(Number(cid))){
                    keyIncludeTaxon = false;
                }
            });
            if(keyIncludeTaxon){
                if(displayTaxonFilterVal.value){
                    if(Number(displayTaxonFilterVal.value['rankid']) === 140 && taxon['family'] === displayTaxonFilterVal.value['sciname']){
                        includeTaxon = true;
                    }
                    else if(Number(displayTaxonFilterVal.value['rankid']) > 140 && (taxon['sciname'] === displayTaxonFilterVal.value['sciname'] || taxon['sciname'].startsWith((displayTaxonFilterVal.value['sciname'] + ' ')))){
                        includeTaxon = true;
                    }
                }
                else{
                    includeTaxon = true;
                }
            }
            if(includeTaxon){
                returnArr.push(taxon);
            }
        });
        if(displaySortVal.value === 'family'){
            returnArr.sort((a, b) => {
                return a['family'].localeCompare(b['family']) || a['sciname'].localeCompare(b['sciname']);
            });
        }
        else{
            returnArr.sort((a, b) => {
                return a['sciname'].localeCompare(b['sciname']);
            });
        }
        return returnArr;
    });
    const getCharacterDependencyDataArr = computed(() => characterDependencyDataArr.value);
    const getChecklistArr = computed(() => checklistArr.value);
    const getChecklistData = computed(() => checklistData.value);
    const getChecklistFlashcardTaxaArr = computed(() => checklistFlashcardTaxaArr.value);
    const getChecklistId = computed(() => checklistId.value);
    const getChecklistImageData = computed(() => checklistImageData.value);
    const getChecklistKeyDataArr = computed(() => checklistKeyDataArr.value);
    const getChecklistTaxaArr = computed(() => checklistTaxaArr.value);
    const getCountData = computed(() => {
        const returnData: any = {};
        const totalArr: any[] = [];
        const speciesArr: string[] = [];
        const generaArr: any[] = [];
        const familyArr: any[] = [];
        getActiveTaxaArr.value.forEach(taxon => {
            if(!totalArr.includes(taxon['sciname'])){
                totalArr.push(taxon['sciname']);
            }
            if(taxon['family'] && taxon['family'] !== '[Incertae Sedis]' && !familyArr.includes(taxon['family'])){
                familyArr.push(taxon['family']);
            }
            if(Number(taxon['rankid']) === 180 && !generaArr.includes(taxon['sciname'])){
                generaArr.push(taxon['sciname']);
            }
            else if(Number(taxon['rankid']) >= 220){
                const unitNameArr = taxon['sciname'].split(' ');
                if(!generaArr.includes(unitNameArr[0])){
                    generaArr.push(unitNameArr[0]);
                }
                if(Number(taxon['rankid']) === 220 && !speciesArr.includes(taxon['sciname'])){
                    speciesArr.push(taxon['sciname']);
                }
                else if(!speciesArr.includes((unitNameArr[0] + ' ' + unitNameArr[1]))){
                    speciesArr.push((unitNameArr[0] + ' ' + unitNameArr[1]));
                }
            }
        });
        returnData['families'] = familyArr.length;
        returnData['genera'] = generaArr.length;
        returnData['species'] = speciesArr.length;
        returnData['total'] = totalArr.length;
        return returnData;
    });
    const getDisplayAuthors = computed(() => displayAuthors.value);
    const getDisplayImages = computed(() => displayImages.value);
    const getDisplayNotes = computed(() => displayNotes.value);
    const getDisplaySortVal = computed(() => displaySortVal.value);
    const getDisplaySynonyms = computed(() => displaySynonyms.value);
    const getDisplayTaxonFilterVal = computed(() => displayTaxonFilterVal.value);
    const getDisplayVernaculars = computed(() => displayVernaculars.value);
    const getImageContentData = computed(() => imageContentData.value);
    const getFlashcardImageContentData = computed(() => flashcardImageContentData.value);
    const getKeyDataExists = computed(() => {
        return checklistCharacterData.value.length > 0 && checklistCharacterHeadingData.value.length > 0 && checklistCharacterStateData.value.length > 0;
    });
    const getPaginatedTaxaArr = computed(() => {
        imageContentData.value = Object.assign({}, {});
        let returnArr: any[];
        if(getActiveTaxaArr.value.length > taxaPerPage){
            let endIndex = getActiveTaxaArr.value.length;
            const index = (paginationPage.value - 1) * taxaPerPage;
            if(getActiveTaxaArr.value.length > (index + taxaPerPage)){
                endIndex = index + taxaPerPage;
            }
            returnArr = getActiveTaxaArr.value.slice(index, endIndex);
        }
        else{
            returnArr = getActiveTaxaArr.value.slice();
        }
        return returnArr;
    });
    const getPaginatedTidArr = computed(() => {
        const returnArr: any[] = [];
        getPaginatedTaxaArr.value.forEach(taxon => {
            returnArr.push(taxon.tid);
        });
        return returnArr;
    });
    const getPaginationLastPageNumber = computed(() => {
        let lastPage = 1;
        if(getActiveTaxaArr.value.length > taxaPerPage){
            lastPage = Math.floor(getActiveTaxaArr.value.length / taxaPerPage);
        }
        if(getActiveTaxaArr.value.length % taxaPerPage){
            lastPage++;
        }
        return lastPage;
    });
    const getPaginationPage = computed(() => paginationPage.value);
    const getSelectedCidArr = computed(() => {
        const valueArr = selectedStateArr.value.length > 0 ? selectedStateArr.value.map(state => Number(state['cid'])) : [];
        return valueArr.length > 0 ? valueArr.filter((value, index, array) => array.indexOf(value) === index) : [];
    });
    const getSelectedCsidArr = computed(() => {
        const valueArr = selectedStateArr.value.length > 0 ? selectedStateArr.value.map(state => Number(state['csid'])) : [];
        return valueArr.length > 0 ? valueArr.filter((value, index, array) => array.indexOf(value) === index) : [];
    });
    const getSelectedStateArr = computed(() => selectedStateArr.value);
    const getTaxaDisplayDataArr = computed(() => {
        const newDataArr: any[] = [];
        if(getPaginatedTaxaArr.value.length > 0){
            getPaginatedTaxaArr.value.forEach(taxon => {
                if(displaySortVal.value === 'family'){
                    const familyObj = newDataArr.find(family => family['familyName'] === taxon['family']);
                    if(familyObj){
                        const taxonObj = familyObj['taxa'].find((fTaxon: { [x: string]: any; }) => Number(fTaxon['tid']) === Number(taxon['tid']));
                        if(taxonObj){
                            if(Number(taxon['clid']) === Number(checklistId.value)){
                                const index = familyObj['taxa'].indexOf(taxonObj);
                                familyObj['taxa'].splice(index, 1, taxon);
                            }
                        }
                        else{
                            familyObj['taxa'].push(taxon);
                        }
                    }
                    else{
                        const taxaArr = [taxon];
                        newDataArr.push({
                            familyName: taxon['family'],
                            taxa: taxaArr
                        });
                    }
                }
                else{
                    const taxonObj = newDataArr.find(fTaxon => Number(fTaxon['tid']) === Number(taxon['tid']));
                    if(taxonObj){
                        if(Number(taxon['clid']) === Number(checklistId.value)){
                            const index = newDataArr.indexOf(taxonObj);
                            newDataArr.splice(index, 1, taxon);
                        }
                    }
                    else{
                        newDataArr.push(taxon);
                    }
                }
            });
            if(displaySortVal.value === 'family'){
                newDataArr.sort((a, b) => {
                    return a['familyName'].localeCompare(b['familyName']);
                });
                newDataArr.forEach(family => {
                    family['taxa'].sort((a: { [x: string]: string; }, b: { [x: string]: any; }) => {
                        return (a && b && a.hasOwnProperty('sciname')) ? a['sciname'].localeCompare(b['sciname']) : 1;
                    });
                });
            }
            else{
                newDataArr.sort((a, b) => {
                    return a['sciname'].localeCompare(b['sciname']);
                });
            }
        }
        return newDataArr.slice();
    });
    const getTaxaFilterOptions = computed(() => taxaFilterOptions.value);
    const getTaxaPerPage = computed(() => taxaPerPage);

    function clearCurrentChecklist(): void {
        activeCidArr.value.length = 0;
        checklistId.value = 0;
        checklistData.value = null;
        checklistImageData.value = Object.assign({}, {});
        checklistCharacterData.value.length = 0;
        checklistCharacterHeadingData.value.length = 0;
        checklistCharacterStateData.value.length = 0;
        checklistKeyDataArr.value.length = 0;
        checklistTaxaArr.value.length = 0;
        characterDependencyDataArr.value.length = 0;
        taxaFilterOptions.value.length = 0;
        checklistFlashcardTaxaArr.value.length = 0;
        checklistFlashcardTidArr.value.length = 0;
    }

    async function createChecklist(checklist: ChecklistInterface, checklistImages: ChecklistImageInterface[], checklistTaxa: ChecklistTaxonInterface[], keyData: any): Promise<boolean> {
        const res = await checklistModel.createChecklist(databaseStore.getDatabaseConnection, checklist);
        if(res && res.hasOwnProperty('changes') && Number(res.changes.changes) > 0){
            await checklistTaxonModel.batchCreateChecklistTaxa(databaseStore.getDatabaseConnection, checklistTaxa);
            if(checklistImages.length > 0){
                await checklistImageModel.batchCreateChecklistImages(databaseStore.getDatabaseConnection, checklistImages);
            }
            if(keyData['character-headings']){
                await characterHeadingModel.createCharacterHeading(databaseStore.getDatabaseConnection, {clid: checklist['clid'], data: keyData['character-headings']});
            }
            if(keyData['characters']){
                await characterModel.createCharacter(databaseStore.getDatabaseConnection, {clid: checklist['clid'], data: keyData['characters']});
            }
            if(keyData['character-states']){
                await characterStateModel.createCharacterState(databaseStore.getDatabaseConnection, {clid: checklist['clid'], data: keyData['character-states']});
            }
            await databaseStore.processDatabaseChange();
            await setChecklistArr();
            return true;
        }
        else{
            return false;
        }
    }

    async function deleteChecklist(clid: number): Promise<capSQLiteChanges | undefined> {
        if(Number(clid) === Number(checklistId.value)){
            await setCurrentChecklist(0);
        }
        await deleteChecklistImageDirectory(clid);
        await characterStateModel.deleteCharacterState(databaseStore.getDatabaseConnection, clid);
        await characterModel.deleteCharacter(databaseStore.getDatabaseConnection, clid);
        await characterHeadingModel.deleteCharacterHeading(databaseStore.getDatabaseConnection, clid);
        await checklistImageModel.deleteChecklistImages(databaseStore.getDatabaseConnection, clid);
        await checklistTaxonModel.deleteChecklistTaxa(databaseStore.getDatabaseConnection, clid);
        const res = await checklistModel.deleteChecklist(databaseStore.getDatabaseConnection, clid);
        await databaseStore.processDatabaseChange();
        await setChecklistArr();
        return res;
    }

    function processCharacterStateSelectionChange(state: any, value: any) {
        if(Number(value) === 1){
            selectedStateArr.value.push(state);
        }
        else{
            const index = selectedStateArr.value.indexOf(state);
            selectedStateArr.value.splice(index, 1);
        }
        setActiveCidArr();
    }

    function processChecklistDefaultDisplaySettings(settings: any): void {
        if(settings.hasOwnProperty('showsynonyms') && Number(settings['showsynonyms']) === 1){
            displaySynonyms.value = true;
        }
        if(settings.hasOwnProperty('dcommon') && Number(settings['dcommon']) === 1){
            displayVernaculars.value = true;
        }
        if(settings.hasOwnProperty('dimages') && Number(settings['dimages']) === 1){
            displayImages.value = true;
        }
        if(settings.hasOwnProperty('dvouchers') && Number(settings['dvouchers']) === 1){
            displayNotes.value = true;
        }
        if(settings.hasOwnProperty('dauthors') && Number(settings['dauthors']) === 1){
            displayAuthors.value = true;
        }
        if(settings.hasOwnProperty('dalpha') && Number(settings['dalpha']) === 1){
            displaySortVal.value = 'sciname';
        }
    }

    function processKeyData(): void {
        checklistCharacterHeadingData.value.forEach((heading: { [x: string]: any[]; }) => {
            const headingCharacterArr: any[] = [];
            const characterArr = checklistCharacterData.value.filter((character: any) => Number(character['chid']) === Number(heading['chid']));
            characterArr.forEach((character: { [x: string]: string | any[]; }) => {
                const characterStateArr: any[] = [];
                const stateArr = checklistCharacterStateData.value.filter((state: any) => Number(state['cid']) === Number(character['cid']));
                stateArr.forEach((state: any) => {
                    characterStateArr.push(state);
                });
                characterStateArr.sort((a, b) => Number(a.sortsequence) - Number(b.sortsequence));
                character['stateArr'] = characterStateArr.slice();
                characterDependencyDataArr.value.push({
                    cid: character['cid'],
                    dependencies: character.hasOwnProperty('dependencies') ? character['dependencies'].slice() : []
                });
                headingCharacterArr.push(character);
            });
            headingCharacterArr.sort((a, b) => Number(a.sortsequence) - Number(b.sortsequence));
            heading['characterArr'] = headingCharacterArr.slice();
            checklistKeyDataArr.value.push(heading);
        });
        checklistKeyDataArr.value.sort((a, b) => Number(a.sortsequence) - Number(b.sortsequence));
        setActiveCidArr();
    }

    function processTaxa() {
        checklistTaxaArr.value.forEach(taxon => {
            if(Number(taxon['rankid']) >= 220 && checklistImageData.value.hasOwnProperty(taxon['tid']) && !checklistFlashcardTaxaArr.value.includes(Number(taxon['tid']))){
                checklistFlashcardTaxaArr.value.push(taxon);
                checklistFlashcardTidArr.value.push(taxon['tid']);
            }
            if(!taxaFilterOptions.value.find(taxonObj => taxonObj['sciname'] === taxon['sciname'])){
                taxaFilterOptions.value.push({sciname: taxon['sciname'], label: taxon['sciname'], rankid: taxon['rankid']});
            }
            if(taxon['family'] && taxon['family'] !== '[Incertae Sedis]'){
                if(!taxaFilterOptions.value.find(taxonObj => taxonObj['sciname'] === taxon['family'])){
                    taxaFilterOptions.value.push({sciname: taxon['family'], label: taxon['family'], rankid: 140});
                }
            }
            if(Number(taxon['rankid']) >= 220){
                const unitNameArr = taxon['sciname'].split(' ');
                if(!taxaFilterOptions.value.find(taxonObj => taxonObj['sciname'] === unitNameArr[0])){
                    taxaFilterOptions.value.push({sciname: unitNameArr[0], label: unitNameArr[0], rankid: 180});
                }
                if(!taxaFilterOptions.value.find(taxonObj => taxonObj['sciname'] === (unitNameArr[0] + ' ' + unitNameArr[1]))){
                    taxaFilterOptions.value.push({sciname: (unitNameArr[0] + ' ' + unitNameArr[1]), label: (unitNameArr[0] + ' ' + unitNameArr[1]), rankid: 220});
                }
            }
        });
        taxaFilterOptions.value.sort((a, b) => {
            return a['sciname'].toLowerCase().localeCompare(b['sciname'].toLowerCase());
        });
    }

    function setActiveCidArr() {
        characterDependencyDataArr.value.forEach(character => {
            if(character['dependencies'].length > 0){
                let active = false;
                character['dependencies'].forEach((dep: { [x: string]: any; }) => {
                    if(!active){
                        if(Number(dep['csid']) === 0){
                            if(getSelectedCidArr.value.includes(Number(dep['cid']))){
                                active = true;
                            }
                        }
                        else{
                            if(getSelectedCsidArr.value.includes(Number(dep['csid']))){
                                active = true;
                            }
                        }
                    }
                });
                if(active && !activeCidArr.value.includes(Number(character['cid']))){
                    activeCidArr.value.push(Number(character['cid']));
                }
                else if(!active){
                    if(activeCidArr.value.includes(Number(character['cid']))){
                        const index = activeCidArr.value.indexOf(Number(character['cid']));
                        activeCidArr.value.splice(index, 1);
                    }
                    if(getSelectedCidArr.value.includes(Number(character['cid']))){
                        const targetStateArr = selectedStateArr.value.filter((state) => Number(state['cid']) === Number(character['cid']));
                        targetStateArr.forEach(state => {
                            const index = selectedStateArr.value.indexOf(state);
                            selectedStateArr.value.splice(index, 1);
                        });
                    }
                }
            }
            else if(!activeCidArr.value.includes(Number(character['cid']))){
                activeCidArr.value.push(Number(character['cid']));
            }
        });
    }

    async function setChecklistArr(): Promise<void> {
        const queryRes = await checklistModel.getChecklists(databaseStore.getDatabaseConnection);
        if(queryRes && queryRes.hasOwnProperty('values')){
            checklistArr.value = queryRes.values as ChecklistInterface[];
        }
    }

    async function setChecklistData(clid: number): Promise<void> {
        const queryRes = await checklistModel.getChecklistById(databaseStore.getDatabaseConnection, clid);
        if(queryRes && queryRes.hasOwnProperty('values') && queryRes.values.length === 1){
            checklistData.value = Object.assign({}, queryRes.values[0]) as ChecklistInterface;
            const checklistDefaultSettings = checklistData.value['defaultSettings'] ? JSON.parse(checklistData.value['defaultSettings']) : null;
            if(checklistDefaultSettings){
                processChecklistDefaultDisplaySettings(checklistDefaultSettings);
            }
        }
        return;
    }

    async function setChecklistImageData(clid: number): Promise<void> {
        const queryRes = await checklistImageModel.getChecklistImagesById(databaseStore.getDatabaseConnection, clid);
        if(queryRes && queryRes.hasOwnProperty('values')){
            queryRes.values.forEach((image) => {
                if(!checklistImageData.value.hasOwnProperty(image.tid)){
                    checklistImageData.value[image.tid] = [];
                }
                checklistImageData.value[image.tid].push(image);
            });
        }
        return;
    }

    async function setChecklistKeyDataArr(clid: number): Promise<void> {
        const headerQueryRes = await characterHeadingModel.getCharacterHeadingById(databaseStore.getDatabaseConnection, clid);
        if(headerQueryRes && headerQueryRes.hasOwnProperty('values') && headerQueryRes.values.length === 1){
            checklistCharacterHeadingData.value = JSON.parse(headerQueryRes.values[0]['dataJson']);
            const charQueryRes = await characterModel.getCharacterById(databaseStore.getDatabaseConnection, clid);
            if(charQueryRes && charQueryRes.hasOwnProperty('values') && charQueryRes.values.length === 1){
                checklistCharacterData.value = JSON.parse(charQueryRes.values[0]['dataJson']);
            }
            const charStateQueryRes = await characterStateModel.getCharacterStateById(databaseStore.getDatabaseConnection, clid);
            if(charStateQueryRes && charStateQueryRes.hasOwnProperty('values') && charStateQueryRes.values.length === 1){
                checklistCharacterStateData.value = JSON.parse(charStateQueryRes.values[0]['dataJson']);
            }
        }
        return;
    }

    async function setChecklistTaxa(clid: number): Promise<void> {
        const queryRes = await checklistTaxonModel.getChecklistTaxaById(databaseStore.getDatabaseConnection, clid);
        if(queryRes && queryRes.hasOwnProperty('values')){
            checklistTaxaArr.value = queryRes.values;
            processTaxa();
        }
        return;
    }

    async function setCurrentChecklist(clid: number): Promise<void> {
        clearCurrentChecklist();
        if(Number(clid) > 0){
            checklistId.value = Number(clid);
            await setChecklistData(clid);
            await setChecklistImageData(clid);
            await setChecklistTaxa(clid);
            await setChecklistKeyDataArr(clid);
            if(checklistCharacterData.value.length > 0 && checklistCharacterHeadingData.value.length > 0 && checklistCharacterStateData.value.length > 0){
                processKeyData();
            }
            await setImageContentData();
        }
    }

    function setDisplayAuthors(value: boolean): void {
        displayAuthors.value = value;
    }

    function setDisplayImages(value: boolean): void {
        displayImages.value = value;
    }

    function setDisplayNotes(value: boolean): void {
        displayNotes.value = value;
    }

    function setDisplaySortVal(value: string): void {
        displaySortVal.value = value;
    }

    function setDisplaySynonyms(value: boolean): void {
        displaySynonyms.value = value;
    }

    function setDisplayTaxonFilterVal(value: any | null): void {
        displayTaxonFilterVal.value = value;
    }

    function setDisplayVernaculars(value: boolean): void {
        displayVernaculars.value = value;
    }

    function setPaginationPage(value: number): void {
        paginationPage.value = value;
    }

    async function setFlashcardImageContentData(): Promise<void> {
        for(const index in checklistFlashcardTidArr.value){
            const tid = checklistFlashcardTidArr.value[index];
            if(checklistImageData.value.hasOwnProperty(tid)){
                if(!flashcardImageContentData.value.hasOwnProperty(tid)){
                    flashcardImageContentData.value[tid] = [];
                }
                for(const index in checklistImageData.value[tid]){
                    const imagedata: any = checklistImageData.value[tid][index];
                    const existingContent = flashcardImageContentData.value[tid].find((image: { [x: string]: any; }) => image['filePath'] === imagedata['filePath']);
                    if(!existingContent){
                        imagedata['contentData'] = await getImageBase64UriStr(imagedata['filePath']);
                        flashcardImageContentData.value[tid].push(imagedata);
                    }
                }
            }
        }
    }

    async function setImageContentData(): Promise<void> {
        for(const index in getPaginatedTidArr.value){
            const tid = getPaginatedTidArr.value[index];
            if(checklistImageData.value.hasOwnProperty(tid)){
                if(!imageContentData.value.hasOwnProperty(tid)){
                    imageContentData.value[tid] = [];
                }
                for(const index in checklistImageData.value[tid]){
                    const imagedata: any = checklistImageData.value[tid][index];
                    const existingContent = imageContentData.value[tid].find((image: { [x: string]: any; }) => image['filePath'] === imagedata['filePath']);
                    if(!existingContent){
                        imagedata['contentData'] = await getImageBase64UriStr(imagedata['filePath']);
                        imageContentData.value[tid].push(imagedata);
                    }
                }
            }
        }
    }

    return {
        getActiveChidArr,
        getActiveCidArr,
        getActiveTaxaArr,
        getCharacterDependencyDataArr,
        getChecklistArr,
        getChecklistData,
        getChecklistFlashcardTaxaArr,
        getChecklistId,
        getChecklistImageData,
        getChecklistKeyDataArr,
        getChecklistTaxaArr,
        getCountData,
        getDisplayAuthors,
        getDisplayImages,
        getDisplayNotes,
        getDisplaySortVal,
        getDisplaySynonyms,
        getDisplayTaxonFilterVal,
        getDisplayVernaculars,
        getImageContentData,
        getFlashcardImageContentData,
        getKeyDataExists,
        getPaginatedTaxaArr,
        getPaginationLastPageNumber,
        getPaginationPage,
        getSelectedCidArr,
        getSelectedCsidArr,
        getSelectedStateArr,
        getTaxaDisplayDataArr,
        getTaxaFilterOptions,
        getTaxaPerPage,
        createChecklist,
        deleteChecklist,
        processCharacterStateSelectionChange,
        setChecklistArr,
        setCurrentChecklist,
        setDisplayAuthors,
        setDisplayImages,
        setDisplayNotes,
        setDisplaySortVal,
        setDisplaySynonyms,
        setDisplayTaxonFilterVal,
        setDisplayVernaculars,
        setFlashcardImageContentData,
        setImageContentData,
        setPaginationPage
    };
});
