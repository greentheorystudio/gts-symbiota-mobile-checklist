import { capSQLiteChanges } from '@capacitor-community/sqlite';
import { defineStore } from 'pinia';
import { Ref, ref, computed } from 'vue';

import { deleteChecklistImageDirectory } from 'src/hooks/core';

import CharacterHeadings from 'src/models/CharacterHeadings';
import CharacterStates from 'src/models/CharacterStates';
import Characters from 'src/models/Characters';
import ChecklistImages from 'src/models/ChecklistImages';
import Checklists from './../models/Checklists';
import ChecklistTaxa from 'src/models/ChecklistTaxa';

import { CharacterHeadingInterface } from 'src/interfaces/CharacterHeadingInterface';
import { CharacterStateInterface } from 'src/interfaces/CharacterStateInterface';
import { CharacterInterface } from 'src/interfaces/CharacterInterface';
import { ChecklistImageInterface } from 'src/interfaces/ChecklistImageInterface';
import { ChecklistInterface } from 'src/interfaces/ChecklistInterface';
import { ChecklistTaxonInterface } from 'src/interfaces/ChecklistTaxonInterface';

import { useDatabaseStore } from 'stores/database';

export const useChecklistStore = defineStore('checklist', () => {

    const characterModel = new Characters;
    const characterHeadingModel = new CharacterHeadings;
    const characterStateModel = new CharacterStates;
    const checklistImageModel = new ChecklistImages;
    const checklistModel = new Checklists;
    const checklistTaxonModel = new ChecklistTaxa;

    const checklistArr: Ref<ChecklistInterface[]> = ref([]);
    const checklistCharacterData: Ref<CharacterInterface | {}> = ref({});
    const checklistCharacterHeadingData: Ref<CharacterHeadingInterface | {}> = ref({});
    const checklistCharacterStateData: Ref<CharacterStateInterface | {}> = ref({});
    const checklistData: Ref<ChecklistInterface | {}> = ref({});
    const checklistId: Ref<number> = ref(0);
    const checklistImageArr: Ref<ChecklistImageInterface[]> = ref([]);
    const checklistTaxaArr: Ref<ChecklistTaxonInterface[]> = ref([]);
    const databaseStore = useDatabaseStore();

    const getChecklistArr = computed(() => checklistArr.value);
    const getChecklistCharacterData = computed(() => checklistCharacterData.value);
    const getChecklistCharacterHeadingData = computed(() => checklistCharacterHeadingData.value);
    const getChecklistCharacterStateData = computed(() => checklistCharacterStateData.value);
    const getChecklistData = computed(() => checklistData.value);
    const getChecklistId = computed(() => checklistId.value);
    const getChecklistImageArr = computed(() => checklistImageArr.value);
    const getChecklistTaxaArr = computed(() => checklistTaxaArr.value);

    function clearCurrentChecklist(): void {
        checklistId.value = 0;
        checklistCharacterData.value = Object.assign({}, {});
        checklistCharacterHeadingData.value = Object.assign({}, {});
        checklistCharacterStateData.value = Object.assign({}, {});
        checklistData.value = Object.assign({}, {});
        checklistImageArr.value.length = 0;
        checklistTaxaArr.value.length = 0;
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

    async function setChecklistArr(): Promise<void> {
        const queryRes = await checklistModel.getChecklists(databaseStore.getDatabaseConnection);
        if(queryRes && queryRes.hasOwnProperty('values')){
            checklistArr.value = queryRes.values as ChecklistInterface[];
        }
    }

    async function setCurrentChecklist(clid: number): Promise<void> {
        clearCurrentChecklist();
        if(Number(clid) > 0){

            checklistId.value = Number(clid);
        }
    }

    return {
        getChecklistArr,
        getChecklistCharacterData,
        getChecklistCharacterHeadingData,
        getChecklistCharacterStateData,
        getChecklistData,
        getChecklistId,
        getChecklistImageArr,
        getChecklistTaxaArr,
        createChecklist,
        deleteChecklist,
        setChecklistArr,
        setCurrentChecklist
    };
});
