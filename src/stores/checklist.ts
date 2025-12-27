import { defineStore } from 'pinia';
import { Ref, ref, computed } from 'vue';

import Checklists from './../models/Checklists';
import { ChecklistInterface } from 'src/interfaces/ChecklistInterface';
import { useDatabaseStore } from 'stores/database';

export const useChecklistStore = defineStore('checklist', () => {

    const checklistArr: Ref<ChecklistInterface[]> = ref([]);
    const checklistModel = new Checklists;
    const databaseStore = useDatabaseStore();

    const getChecklistArr = computed(() => checklistArr.value);

    async function createChecklist(checklist: ChecklistInterface): Promise<void> {
        const res = await checklistModel.createChecklist(databaseStore.getDatabaseConnection, checklist);
        await databaseStore.processDatabaseChange();
        /*if(queryRes && queryRes.hasOwnProperty('values')){
            checklistArr.value = queryRes.values as ChecklistInterface[];
        }*/
    }

    async function setChecklistArr(): Promise<void> {
        const queryRes = await checklistModel.getChecklists(databaseStore.getDatabaseConnection);
        if(queryRes && queryRes.hasOwnProperty('values')){
            checklistArr.value = queryRes.values as ChecklistInterface[];
        }
    }

    return {
        checklistArr,
        getChecklistArr,
        createChecklist,
        setChecklistArr,
    };
});
