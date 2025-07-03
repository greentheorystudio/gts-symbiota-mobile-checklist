<template>
    <q-page class="flex flex-center">
        <div class="text-h6 text-bold">
            <template v-if="checklistArr.length > 0">
                <div>Select a checklist from the dropdown above to view</div>
            </template>
            <template v-else-if="remoteChecklistArr.length > 0">
                <div>Click the Management button in the top right corner to download checklists to your device</div>
            </template>
            <template v-else-if="!remoteConnectionEstablished">
                <div>Out of internet connection</div>
            </template>
        </div>
    </q-page>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from 'vue';

export default defineComponent({
    name: 'MainPage',
    setup() {
        const checklistDisplayStore = inject('checklistDisplayStore');
        const checklistRemoteStore = inject('checklistRemoteStore');

        const checklistArr = computed(() => checklistDisplayStore.getChecklistArr);
        const remoteChecklistArr = computed(() => checklistRemoteStore.getChecklistArr);
        const remoteConnectionEstablished = computed(() => checklistRemoteStore.getRemoteConnectionEstablished);

        return {
            checklistArr,
            remoteChecklistArr,
            remoteConnectionEstablished
        };
    }
});
</script>
