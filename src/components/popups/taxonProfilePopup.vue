<template>
    <q-dialog v-model="displayPopup" full-width full-height>
        <q-card class="overflow-hidden">
            <q-resize-observer @resize="setCardSize" />
            <q-card-section class="q-pa-none row justify-between q-gutter-sm no-wrap">
                <q-resize-observer @resize="setHeaderSize" />
                <div class="q-py-sm q-pl-sm text-h5">
                    <span class="text-bold text-italic">{{ taxon['sciname'] }}</span> {{ taxon['author'] }}
                </div>
                <div>
                    <q-btn square glossy padding="5px 10px" color="negative" icon="close" @click="closePopup();"></q-btn>
                </div>
            </q-card-section>
            <q-card-section class="q-pl-md q-py-none">
                <q-scroll-area :style="scrollerStyle">
                    <div v-if="taxon['family']" class="text-subtitle1"><span class="text-bold">Family: </span>{{ taxon['family'] }}</div>
                    <div v-if="taxon['vernacularJson']" class="text-subtitle1">
                        {{ getVernacularStrFromArr(taxon['vernacularJson']) }}
                    </div>
                    <div v-if="taxon['synonymyJson']" class="text-subtitle1 text-italic">
                        {{ getSynonymStrFromArr(taxon['synonymyJson']) }}
                    </div>
                    <div v-if="taxon['habitat']" class="text-subtitle1"><span class="text-bold">Habitat: </span>{{ taxon['habitat'] }}</div>
                    <div v-if="taxon['abundance']" class="text-subtitle1"><span class="text-bold">Abundance: </span>{{ taxon['abundance'] }}</div>
                    <div v-if="taxon['notes']" class="text-subtitle1"><span class="text-bold">Notes: </span>{{ taxon['notes'] }}</div>
                    <div v-if="taxon['descriptionJson'] && taxon['descriptionJson']['statements'].length > 0" class="column">
                        <div class="q-mb-sm text-subtitle1 text-bold">
                            {{ taxon['descriptionJson']['caption'] + ':' }}
                        </div>
                        <div class="q-pl-md column q-col-gutter-xs">
                            <template v-for="statement in taxon['descriptionJson']['statements']">
                                <div class="text-body1">
                                    <span v-if="statement['heading'] && Number(statement['displayheader']) === 1">{{ statement['heading'] + ': ' }}</span>
                                    <span v-html="statement['statement']"></span>
                                </div>
                            </template>
                        </div>
                    </div>
                    <div v-if="taxonImageArr.length > 0" class="q-mt-sm column q-col-gutter-sm">
                        <template v-for="image in taxonImageArr">
                            <div>
                                <q-img class="rounded-borders" :width="imageWidth" :src="image['contentData']" fit="scale-down" :alt="(image['alttext'] ? image['alttext'] : taxon['sciname'])"></q-img>
                            </div>
                        </template>
                    </div>
                </q-scroll-area>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
<script setup>
import {computed, onMounted, ref, toRefs, watch} from 'vue';

import { useChecklistStore } from 'src/stores/checklist';

const checklistStore = useChecklistStore();

const props = defineProps({
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
const checklistImageData = computed(() => checklistStore.getImageContentData);
const displayPopup = ref(false);
const headerHeight = ref(0);
const imageWidth = computed(() => {
    return (cardWidth.value - 30) + 'px';
});
const propsRefs = toRefs(props);
const scrollerStyle = computed(() => {
    return 'width: ' + cardWidth.value + 'px;height: ' + (cardHeight.value - headerHeight.value) + 'px;';
});
const taxonImageArr = computed(() => {
    return (checklistImageData['value'].hasOwnProperty(props.taxon['tid']) && checklistImageData['value'][props.taxon['tid']].length > 0) ? checklistImageData['value'][props.taxon['tid']] : [];
});

watch(propsRefs.showPopup, () => {
    setDisplayValue();
});

function closePopup() {
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
    return nameArr.length > 0 ? ('[' + nameArr.join(', ') + ']') : '';
}

function getVernacularStrFromArr(vernacularJson) {
    const nameArr = [];
    if(vernacularJson){
        const vernacularArr = JSON.parse(vernacularJson);
        if(vernacularArr && vernacularArr.length > 0){
            vernacularArr.forEach(vernacular => {
                if(vernacular['vernacularname']){
                    nameArr.push(vernacular['vernacularname']);
                }
            });
        }
    }
    return nameArr.length > 0 ? nameArr.join(', ') : '';
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
