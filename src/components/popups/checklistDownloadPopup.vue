<template>
    <q-dialog v-model="displayPopup" full-width full-height>
        <q-card class="overflow-hidden">
            <q-resize-observer @resize="setCardSize" />
            <q-card-section class="q-pa-none row justify-between q-gutter-sm no-wrap">
                <q-resize-observer @resize="setHeaderSize" />
                <div class="q-py-sm q-pl-sm text-h5 text-bold">Download Checklists</div>
                <div>
                    <q-btn square glossy padding="5px 10px" color="negative" icon="close" @click="closePopup();"></q-btn>
                </div>
            </q-card-section>
            <q-card-section>
                <template v-if="checklistDownloadOptionArr.length > 0">
                    <q-scroll-area :style="scrollerStyle">
                        <q-list bordered separator>
                            <template v-for="checklist in checklistDownloadOptionArr">
                                <q-item tag="label">
                                    <q-item-section>
                                        <q-item-label class="text-bold">{{ checklist.name }}</q-item-label>
                                    </q-item-section>
                                    <q-item-section side top>
                                        <div class="row q-gutter-sm">
                                            <q-btn dense round icon="info" @click="openChecklistInfoPopup(checklist)"></q-btn>
                                            <q-btn dense round icon="download_for_offline" aria-label="Download" @click="installChecklist(checklist)" />
                                        </div>
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-list>
                    </q-scroll-area>
                </template>
                <template v-else>
                    <div :style="scrollerStyle" class="flex flex-center">
                        <div class="text-center text-subtitle1 text-bold text-grey-8">
                            There are no more checklists available to download from the portal
                        </div>
                    </div>
                </template>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
<script setup>
import { computed, inject, onMounted, ref, toRefs, watch } from 'vue';

import {
    hideWorking,
    showNotification,
    showWorking
} from 'src/hooks/core';

import { useChecklistStore } from 'src/stores/checklist';
import { useChecklistRemoteStore } from 'src/stores/checklist-remote';

const props = defineProps({
    showPopup: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close:popup']);

const checklistStore = useChecklistStore();
const checklistRemoteStore = useChecklistRemoteStore();

const cardHeight = ref(0);
const cardWidth = ref(0);
const checklistArr = computed(() => checklistStore.getChecklistArr);
const checklistDownloadOptionArr = computed(() => {
    const returnArr = [];
    remoteChecklistArr.value.forEach((checklist) => {
        const existingChecklist = checklistArr.value.find(eChecklist => Number(eChecklist['clid']) === Number(checklist['clid']));
        if(!existingChecklist){
            returnArr.push(checklist);
        }
    });
    return returnArr;
});
const displayPopup = ref(false);
const headerHeight = ref(0);
const propsRefs = toRefs(props);
const remoteChecklistArr = computed(() => checklistRemoteStore.getChecklistArr);
const scrollerStyle = computed(() => {
    return 'width: ' + (cardWidth.value - 30) + 'px;height: ' + (cardHeight.value - headerHeight.value) + 'px;';
});

const openChecklistInfoPopup = inject('openChecklistInfoPopup');

watch(propsRefs.showPopup, () => {
    setDisplayValue();
});

function closePopup() {
    emit('close:popup');
}

async function installChecklist(checklist) {
    showWorking('Initializing download');
    await checklistRemoteStore.installChecklist(checklist, (res) => {
        hideWorking();
        if(Number(res) === 1){
            showNotification('positive','Checklist downloaded');
        }
        else{
            showNotification('negative', res);
        }
    });
}

function setCardSize(cardSize) {
    cardHeight.value = cardSize.height;
    cardWidth.value = cardSize.width;
}

function setDisplayValue() {
    displayPopup.value = props.showPopup;
}

function setHeaderSize(headerSize) {
    headerHeight.value = headerSize.height;
}

onMounted(() => {
    setDisplayValue();
});
</script>
