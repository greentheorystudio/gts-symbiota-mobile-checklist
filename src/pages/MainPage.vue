<template>
    <q-page class="q-pa-none">
        <template v-if="Number(checklistId) > 0">
            <div class="fit">
                <div class="fit">
                    <checklistModule></checklistModule>
                </div>
                <q-page-sticky v-if="keyDataExists" position="left" :offset="[-5, 0]" @click="toggleLeftDrawer">
                    <q-btn square padding="25px 0" color="primary" icon="arrow_right"></q-btn>
                </q-page-sticky>
            </div>
        </template>
        <template v-else>
            <div :style="textBoxStyle" class="flex flex-center">
                <div class="full-width text-center text-h6 text-bold text-grey-8">
                    <template v-if="checklistArr.length > 0">
                        Select a checklist from the dropdown above to view
                    </template>
                    <template v-else-if="remoteChecklistArr.length > 0">
                        Tap the Download button in the top right corner to download checklists to your device
                    </template>
                    <template v-else-if="!remoteConnectionEstablished">
                        Out of internet connection
                    </template>
                </div>
            </div>
        </template>
    </q-page>
</template>
<script setup>
import {computed, inject, ref} from 'vue';

import { useChecklistStore } from 'src/stores/checklist';
import { useChecklistRemoteStore } from 'src/stores/checklist-remote';

import checklistModule from 'src/components/layout/checklistModule.vue';

const checklistStore = useChecklistStore();
const checklistRemoteStore = useChecklistRemoteStore();

const checklistArr = computed(() => checklistStore.getChecklistArr);
const checklistId = computed(() => checklistStore.getChecklistId);
const keyDataExists = computed(() => checklistStore.getKeyDataExists);
const remoteChecklistArr = computed(() => checklistRemoteStore.getChecklistArr);
const remoteConnectionEstablished = computed(() => checklistRemoteStore.getRemoteConnectionEstablished);
const textBoxStyle = computed(() => {
    return 'width: ' + windowWidth.value + 'px;height: ' + (windowHeight.value - headerHeight.value - 50) + 'px;';
});

const headerHeight = inject('headerHeight');
const toggleLeftDrawer = inject('toggleLeftDrawer');
const windowHeight = inject('windowHeight');
const windowWidth = inject('windowWidth');
</script>
