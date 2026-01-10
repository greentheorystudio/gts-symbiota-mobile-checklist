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
                                        <template v-if="displayCommonNames && taxon['vernacularJson']">
                                            <div class="text-body1">{{ getVernacularStrFromArr(taxon['vernacularJson']) }}</div>
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
                            <template v-if="displayCommonNames && taxon['vernacularJson']">
                                <div class="text-body1">{{ getVernacularStrFromArr(taxon['vernacularJson']) }}</div>
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
import {inject, onMounted, ref, watch} from 'vue';

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

const cardStyle = ref(null);
const containerRef = ref(null);
const imageHeight = ref(null);

const openTaxonProfilePopup = inject('openTaxonProfilePopup');

watch(containerRef, () => {
    setContentStyle();
});

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

function setContentStyle() {
    cardStyle.value = null;
    imageHeight.value = null;
    if(containerRef['value']){
        let cardDim;
        if(containerRef['value'].clientWidth > 900){
            cardDim = (containerRef['value'].clientWidth / 4) - 30;
        }
        else if(containerRef['value'].clientWidth > 600){
            cardDim = (containerRef['value'].clientWidth / 3) - 30;
        }
        else if(containerRef['value'].clientWidth > 400){
            cardDim = (containerRef['value'].clientWidth / 2) - 30;
        }
        else{
            cardDim = containerRef['value'].clientWidth - 30;
        }
        cardStyle.value = 'width: ' + cardDim + 'px;';
        imageHeight.value = cardDim + 'px';
    }
}

onMounted(() => {
    setContentStyle();
});
</script>
