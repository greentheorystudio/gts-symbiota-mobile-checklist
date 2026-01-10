<template>
    <div class="q-pa-md column q-gutter-sm no-wrap">
        <template v-if="sortBy === 'family'">
            <template v-for="family in taxaArr">
                <div class="full-width column no-wrap">
                    <div class="full-width text-h6 text-bold">
                        {{ family['familyName'] }}
                    </div>
                    <template v-for="taxon in family['taxa']">
                        <div class="q-pl-sm q-mb-xs full-width column" @click="openTaxonProfilePopup(taxon)">
                            <div class="text-body1">
                                <div class="text-black">
                                    <span class="text-bold text-italic">
                                        {{ taxon['sciname'] }}
                                    </span>
                                    <template v-if="displayAuthors && taxon['author']">
                                        <span class="q-ml-sm text-bold">{{ taxon['author'] }}</span>
                                    </template>
                                    <template v-if="displayCommonNames && taxon['vernacularJson']">
                                        <span>{{ getVernacularStrFromArr(taxon['vernacularJson']) }}</span>
                                    </template>
                                </div>
                            </div>
                            <div v-if="displaySynonyms && taxon['synonymyJson']" class="q-ml-md text-italic">
                                {{ getSynonymStrFromArr(taxon['synonymyJson']) }}
                            </div>
                            <div v-if="displayNotes && (taxon['habitat'] || taxon['abundance'] || taxon['notes'])" class="q-ml-md">
                                <span v-if="taxon['habitat']">{{ taxon['habitat'] + ((taxon['abundance'] || taxon['notes']) ? ', ' : '') }}</span>
                                <span v-if="taxon['abundance']">{{ taxon['abundance'] + ((taxon['notes']) ? ', ' : '') }}</span>
                                <span v-if="taxon['notes']">{{ taxon['notes'] }}</span>
                            </div>
                        </div>
                    </template>
                </div>
            </template>
        </template>
        <template v-else>
            <template v-for="taxon in taxaArr">
                <div class="q-pl-sm q-mb-xs full-width column" @click="openTaxonProfilePopup(taxon)">
                    <div class="text-body1">
                        <div class="text-black">
                            <span class="text-bold text-italic">
                                {{ taxon['sciname'] }}
                            </span>
                            <template v-if="displayAuthors && taxon['author']">
                                <span class="q-ml-sm text-bold">{{ taxon['author'] }}</span>
                            </template>
                            <template v-if="displayCommonNames && taxon['vernacularJson']">
                                <span>{{ getVernacularStrFromArr(taxon['vernacularJson']) }}</span>
                            </template>
                        </div>
                    </div>
                    <div v-if="displaySynonyms && taxon['synonymyJson']" class="q-ml-md text-italic">
                        {{ getSynonymStrFromArr(taxon['synonymyJson']) }}
                    </div>
                    <div v-if="displayNotes && (taxon['habitat'] || taxon['abundance'] || taxon['notes'])" class="q-ml-md">
                        <span v-if="taxon['habitat']">{{ taxon['habitat'] + ((taxon['abundance'] || taxon['notes']) ? ', ' : '') }}</span>
                        <span v-if="taxon['abundance']">{{ taxon['abundance'] + ((taxon['notes']) ? ', ' : '') }}</span>
                        <span v-if="taxon['notes']">{{ taxon['notes'] }}</span>
                    </div>
                </div>
            </template>
        </template>
    </div>
</template>
<script setup>
import {inject} from "vue";

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
    sortBy: {
        type: String,
        default: 'family'
    },
    taxaArr: {
        type: Array,
        default: []
    }
});

const openTaxonProfilePopup = inject('openTaxonProfilePopup');

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
    return nameArr.length > 0 ? (' - ' + nameArr.join(', ')) : '';
}
</script>
