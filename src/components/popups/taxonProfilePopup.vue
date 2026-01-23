<template>
    <q-dialog v-model="displayPopup" full-width full-height>
        <q-card class="overflow-hidden">
            <q-resize-observer @resize="setCardSize" />
            <q-card-section class="q-pa-none row justify-between q-gutter-sm no-wrap">
                <q-resize-observer @resize="setHeaderSize" />
                <div class="q-py-sm q-pl-sm column">
                    <div class="text-h5">
                        <span class="text-bold text-italic">{{ taxon['sciname'] }}</span> {{ taxon['author'] }}
                    </div>
                    <div v-if="taxon['family']" class="q-pl-md text-subtitle1">
                        <span class="text-bold">Family: </span>{{ taxon['family'] }}
                    </div>
                </div>
                <div>
                    <q-btn square glossy padding="5px 10px" color="negative" icon="close" @click="closePopup();"></q-btn>
                </div>
            </q-card-section>
            <q-card-section class="q-pa-none">
                <q-tabs v-model="selectedTab" content-class="bg-grey-3" active-bg-color="grey-4" align="left">
                    <q-resize-observer @resize="setTabSize" />
                    <q-tab v-if="taxonImageArr.length > 0" class="bg-grey-3" label="Images" name="images" no-caps />
                    <q-tab class="bg-grey-3" label="Details" name="details" no-caps />
                    <q-tab v-if="mapImageContentData" class="bg-grey-3" label="Map" name="map" no-caps />
                </q-tabs>
                <q-separator></q-separator>
                <q-tab-panels v-model="selectedTab" animated>
                    <q-tab-panel v-if="taxonImageArr.length > 0" name="images" :style="tabPanelStyle">
                        <div class="q-py-sm q-pl-xs column q-col-gutter-sm">
                            <template v-for="image in taxonImageArr">
                                <div>
                                    <q-img class="rounded-borders" :width="imageWidth" :src="image['contentData']" fit="contain" :alt="(image['alttext'] ? image['alttext'] : taxon['sciname'])"></q-img>
                                </div>
                            </template>
                        </div>
                    </q-tab-panel>
                    <q-tab-panel name="details" :style="tabPanelStyle">
                        <div class="q-pa-sm column q-gutter-xs">
                            <div v-if="getVernacularStrFromArr(taxon['vernacularJson'])" class="text-subtitle1">
                                <span class="text-bold">Common names: </span>{{ getVernacularStrFromArr(taxon['vernacularJson']) }}
                            </div>
                            <div v-if="getSynonymStrFromArr(taxon['synonymyJson'])" class="text-subtitle1 text-italic">
                                <span class="text-bold">Synonyms: </span>{{ getSynonymStrFromArr(taxon['synonymyJson']) }}
                            </div>
                            <div v-if="taxon['habitat']" class="text-subtitle1"><span class="text-bold">Habitat: </span>{{ taxon['habitat'] }}</div>
                            <div v-if="taxon['abundance']" class="text-subtitle1"><span class="text-bold">Abundance: </span>{{ taxon['abundance'] }}</div>
                            <div v-if="taxon['notes']" class="text-subtitle1"><span class="text-bold">Notes: </span>{{ taxon['notes'] }}</div>
                            <template v-if="descriptionData && descriptionData['statements'].length > 0">
                                <template v-for="statement in descriptionData['statements']">
                                    <div class="text-body1">
                                        <span v-if="statement['heading'] && Number(statement['displayheader']) === 1" class="text-bold">{{ statement['heading'] + ': ' }}</span>
                                        <span v-html="statement['statement']"></span>
                                    </div>
                                </template>
                            </template>
                        </div>
                    </q-tab-panel>
                    <q-tab-panel v-if="mapImageContentData" name="map" :style="tabPanelStyle">
                        <div class="q-mt-lg">
                            <q-img class="rounded-borders" :width="imageWidth" :src="mapImageContentData['contentData']" fit="contain"></q-img>
                        </div>
                    </q-tab-panel>
                </q-tab-panels>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
<script setup>
import {computed, onMounted, ref, toRefs, watch} from 'vue';

import { useChecklistStore } from 'src/stores/checklist';

const checklistStore = useChecklistStore();

const props = defineProps({
    flashcard: {
        type: Boolean,
        default: false
    },
    showPopup: {
        type: Boolean,
        default: false
    },
    taxon: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['close:popup']);

const cardHeight = ref(0);
const cardWidth = ref(0);
const checklistImageData = computed(() => {
    if(props.flashcard){
        return checklistStore.getFlashcardImageContentData;
    }
    else{
        return checklistStore.getImageContentData;
    }
});
const descriptionData = computed(() => {
    let returnData = null;
    if(props.taxon['descriptionJson']){
        returnData = JSON.parse(props.taxon['descriptionJson']);
    }
    return returnData;
});
const displayPopup = ref(false);
const headerHeight = ref(0);
const imageWidth = computed(() => {
    return (cardWidth.value - 40) + 'px';
});
const mapImageContentData = ref(null);
const propsRefs = toRefs(props);
const selectedTab = ref('details');
const tabHeight = ref(0);
const tabPanelStyle = computed(() => {
    return 'width: ' + cardWidth.value + 'px;height: ' + (cardHeight.value - headerHeight.value - tabHeight.value) + 'px;';
});
const tabWidth = ref(0);
const taxonImageArr = computed(() => {
    return (checklistImageData['value'].hasOwnProperty(props.taxon['tid']) && checklistImageData['value'][props.taxon['tid']].length > 0) ? checklistImageData['value'][props.taxon['tid']] : [];
});

watch(propsRefs.showPopup, () => {
    setDisplayValue();
});

function closePopup() {
    mapImageContentData.value = null;
    selectedTab.value = 'details';
    emit('close:popup');
}

function getSynonymStrFromArr(synonymJson) {
    const nameArr = [];
    if(synonymJson){
        const synonymArr = JSON.parse(synonymJson);
        if(synonymArr && synonymArr.length > 0){
            synonymArr.forEach(synonym => {
                if(synonym['sciname']){
                    nameArr.push(synonym['sciname']);
                }
            });
        }
    }
    return nameArr.length > 0 ? ('[' + nameArr.join(', ') + ']') : null;
}

function getVernacularStrFromArr(vernacularJson) {
    const nameArr = [];
    if(vernacularJson){
        const vernacularArr = JSON.parse(vernacularJson);
        if(vernacularArr && vernacularArr.length > 0){
            vernacularArr.forEach(vernacular => {
                if(vernacular['vernacularname'] && Number(props.taxon['tid']) === Number(vernacular['vernaculartid'])){
                    nameArr.push(vernacular['vernacularname']);
                }
            });
        }
    }
    return nameArr.length > 0 ? nameArr.join(', ') : null;
}

function setCardSize(cardSize) {
    cardHeight.value = cardSize.height;
    cardWidth.value = cardSize.width;
}

function setDisplayValue() {
    if(props.showPopup){
        setMapImageContentData();
        if(taxonImageArr.value.length > 0){
            selectedTab.value = 'images';
        }
    }
    displayPopup.value = props.showPopup;
}

function setHeaderSize(headerSize) {
    headerHeight.value = headerSize.height;
}

async function setMapImageContentData() {
    mapImageContentData.value = await checklistStore.getMapImageContentData(props.taxon['tid']);
}

function setTabSize(panelSize) {
    tabHeight.value = panelSize.height;
    tabWidth.value = panelSize.width;
}

onMounted(() => {
    setDisplayValue();
});
</script>
