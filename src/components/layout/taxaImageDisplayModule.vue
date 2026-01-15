<template>
    <div ref="containerRef" class="fit q-pa-sm">
        <template v-if="sortBy === 'family'">
            <div class="column no-wrap q-gutter-sm">
                <template v-for="family in taxaArr">
                    <div class="full-width column">
                        <div class="full-width text-h6 text-bold">
                            {{ family['familyName'] }}
                        </div>
                        <div class="full-width row q-gutter-sm">
                            <template v-for="taxon in family['taxa']">
                                <q-card bordered @click="openTaxonProfilePopup(taxon)" :style="cardStyle">
                                    <template v-if="imageData.hasOwnProperty(taxon['tid']) && imageData[taxon['tid']].length > 0">
                                        <q-img class="rounded-borders" :height="imageHeight" :src="imageData[taxon['tid']][0]['contentData']" fit="scale-down" :alt="(imageData[taxon['tid']][0]['alttext'] ? imageData[taxon['tid']][0]['alttext'] : taxon['sciname'])"></q-img>
                                    </template>
                                    <template v-else>
                                        <div class="column justify-center" :style="('height: ' + imageHeight + ';')">
                                            <div class="text-body1 text-bold text-center">Image not available</div>
                                        </div>
                                    </template>
                                    <q-card-section class="q-pa-sm">
                                        <div class="text-body1">
                                            <span class="text-bold text-italic">
                                                {{ taxon['sciname'] }}
                                            </span>
                                            <template v-if="displayAuthors && taxon['author']">
                                                <span class="q-ml-sm text-bold">{{ taxon['author'] }}</span>
                                            </template>
                                        </div>
                                        <template v-if="displayCommonNames && taxon['vernacularJson'] && getVernacularStrFromArr(taxon['vernacularJson'], taxon['tid'])">
                                            <div class="text-body1">{{ getVernacularStrFromArr(taxon['vernacularJson'], taxon['tid']) }}</div>
                                        </template>
                                        <div v-if="displaySynonyms && taxon['synonymyJson']" class="text-italic">
                                            {{ getSynonymStrFromArr(taxon['synonymyJson']) }}
                                        </div>
                                        <div v-if="displayNotes && taxon['notes']" class="text-italic">
                                            {{ taxon['notes'] }}
                                        </div>
                                    </q-card-section>
                                </q-card>
                            </template>
                        </div>
                    </div>
                </template>
            </div>
        </template>
        <template v-else>
            <div class="full-width row q-gutter-sm">
                <template v-for="taxon in taxaArr">
                    <q-card bordered @click="openTaxonProfilePopup(taxon)" :style="cardStyle">
                        <template v-if="imageData.hasOwnProperty(taxon['tid']) && imageData[taxon['tid']].length > 0">
                            <q-img class="rounded-borders" :height="imageHeight" :src="imageData[taxon['tid']][0]['contentData']" fit="scale-down" :alt="(imageData[taxon['tid']][0]['alttext'] ? imageData[taxon['tid']][0]['alttext'] : taxon['sciname'])"></q-img>
                        </template>
                        <template v-else>
                            <div class="column justify-center" :style="('height: ' + imageHeight + ';')">
                                <div class="text-body1 text-bold text-center">Image not available</div>
                            </div>
                        </template>
                        <q-card-section class="q-pa-sm">
                            <div class="text-body1 text-black">
                                <span class="text-bold text-italic">
                                    {{ taxon['sciname'] }}
                                </span>
                                <template v-if="displayAuthors && taxon['author']">
                                    <span class="q-ml-sm text-bold">{{ taxon['author'] }}</span>
                                </template>
                            </div>
                            <template v-if="displayCommonNames && taxon['vernacularJson'] && getVernacularStrFromArr(taxon['vernacularJson'], taxon['tid'])">
                                <div class="text-body1">{{ getVernacularStrFromArr(taxon['vernacularJson'], taxon['tid']) }}</div>
                            </template>
                            <div v-if="displaySynonyms && taxon['synonymyJson']" class="text-italic">
                                {{ getSynonymStrFromArr(taxon['synonymyJson']) }}
                            </div>
                            <div v-if="displayNotes && taxon['notes']" class="text-italic">
                                {{ taxon['notes'] }}
                            </div>
                        </q-card-section>
                    </q-card>
                </template>
            </div>
        </template>
    </div>
</template>
<script setup>
import { computed, inject, ref } from 'vue';

defineProps({
    displayAuthors: {
        type: Boolean,
        default: false
    },
    displayCommonNames: {
        type: Boolean,
        default: false
    },
    displayNotes: {
        type: Boolean,
        default: false
    },
    displaySynonyms: {
        type: Boolean,
        default: false
    },
    imageData: {
        type: Object,
        default: {}
    },
    sortBy: {
        type: String,
        default: 'family'
    },
    taxaArr: {
        type: Array,
        default: []
    }
});

const cardDimensions = computed(() => {
    let returnVal = 0;
    if(windowWidth.value > 0){
        if(windowWidth.value > 1440){
            returnVal = (windowWidth.value / 4) - 110;
        }
        else if(windowWidth.value > 1024){
            returnVal = (windowWidth.value / 3) - 110;
        }
        else if(windowWidth.value > 600){
            returnVal = (windowWidth.value / 2) - 110;
        }
        else{
            returnVal = windowWidth.value - 110;
        }
    }
    return returnVal;
});
const cardStyle = computed(() => {
    let returnVal = null;
    if(cardDimensions.value > 0){
        returnVal = 'width: ' + cardDimensions.value + 'px;';
    }
    return returnVal;
});
const containerRef = ref(null);
const imageHeight = computed(() => {
    let returnVal = null;
    if(cardDimensions.value > 0){
        returnVal = cardDimensions.value + 'px';
    }
    return returnVal;
});

const openTaxonProfilePopup = inject('openTaxonProfilePopup');
const windowWidth = inject('windowWidth');

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

function getVernacularStrFromArr(vernacularJson, tid) {
    const nameArr = [];
    if(vernacularJson){
        const vernacularArr = JSON.parse(vernacularJson);
        if(vernacularArr && vernacularArr.length > 0){
            vernacularArr.forEach(vernacular => {
                if(vernacular['vernacularname'] && Number(tid) === Number(vernacular['vernaculartid'])){
                    nameArr.push(vernacular['vernacularname']);
                }
            });
        }
    }
    return nameArr.length > 0 ? nameArr.join(', ') : null;
}
</script>
