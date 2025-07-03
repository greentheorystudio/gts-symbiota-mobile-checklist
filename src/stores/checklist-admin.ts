import { defineStore } from 'pinia';
import { Ref, ref, computed } from 'vue';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';

import Checklists from './../models/Checklists';
import { ChecklistInterface } from 'src/models/Checklists';

export const useChecklistAdminStore = defineStore('checklist-admin', () => {

    const checklistModel = new Checklists;
    const databaseConnection: Ref<SQLiteDBConnection|undefined> = ref(undefined);

    function setDatabaseConnection(connection: SQLiteDBConnection|undefined): void {
        databaseConnection.value = connection;
    }

    return {
        setDatabaseConnection
    };
});
