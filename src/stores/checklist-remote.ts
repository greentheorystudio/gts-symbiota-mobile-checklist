import { defineStore } from 'pinia';
import { ComputedRef, Ref, ref, computed } from 'vue';

import { RemoteChecklistInterface } from 'src/models/RemoteChecklists';

export const useChecklistRemoteStore = defineStore('checklist-remote', () => {

    const apiPrefix: string = 'https://www.cal-ibis.org';
    const checklistArr = ref([]);
    const remoteConnectionEstablished = ref(true);

    const getApiUrl: ComputedRef<string> = computed(() => {
        return apiPrefix + '/api/checklists/checklistController.php';
    });
    const getChecklistArr = computed(() => {
        return checklistArr.value;
    });
    const getRemoteConnectionEstablished = computed(() => {
        return remoteConnectionEstablished.value;
    });

    function setChecklistArr(): void {
        const formData = new FormData();
        formData.append('action', 'getChecklistArr');
        fetch(getApiUrl.value, {
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
        checklistArr,
        getChecklistArr,
        getRemoteConnectionEstablished,
        setChecklistArr
    };
});
