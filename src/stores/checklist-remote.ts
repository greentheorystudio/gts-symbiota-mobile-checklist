import { defineStore } from 'pinia';
import { ComputedRef, ref, Ref, computed } from 'vue';

export const useChecklistRemoteStore = defineStore('checklist-remote', () => {
    const apiBaseUrl: Ref<string|null> = ref(null);
    const checklistArr = ref([]);
    const remoteConnectionEstablished = ref(true);

    const getChecklistApiUrl: ComputedRef<string> = computed(() => {
        return apiBaseUrl.value + '/api/checklists/checklistController.php';
    });
    const getChecklistArr = computed(() => {
        return checklistArr.value;
    });
    const getChecklistTaxaApiUrl: ComputedRef<string> = computed(() => {
        return apiBaseUrl.value + '/api/checklists/checklistTaxaController.php';
    });
    const getRemoteConnectionEstablished = computed(() => {
        return remoteConnectionEstablished.value;
    });

    function setApiBaseUrl(url: string): void {
        apiBaseUrl.value = url;
    }

    function setChecklistArr(): void {
        const formData = new FormData();
        formData.append('action', 'getChecklistArr');
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
        checklistArr,
        getChecklistArr,
        getRemoteConnectionEstablished,
        setApiBaseUrl,
        setChecklistArr
    };
});
