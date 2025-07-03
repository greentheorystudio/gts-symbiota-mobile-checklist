import { defineStore } from 'pinia';
import { Ref, ref, computed } from 'vue';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';

import Checklists from './../models/Checklists';
import { ChecklistInterface } from 'src/models/Checklists';

export const useChecklistDisplayStore = defineStore('checklist-display', () => {

    const checklistArr: Ref<ChecklistInterface[]> = ref([]);
    const checklistModel = new Checklists;
    const databaseConnection: Ref<SQLiteDBConnection|undefined> = ref(undefined);

    const getChecklistArr = computed(() => checklistArr.value);

    async function setChecklistArr(): Promise<void> {
        checklistArr.value = await checklistModel.getChecklists(databaseConnection.value);
    }

    function setDatabaseConnection(connection: SQLiteDBConnection|undefined): void {
        databaseConnection.value = connection;
    }

    return {
        checklistArr,
        getChecklistArr,
        setChecklistArr,
        setDatabaseConnection
    };
});
