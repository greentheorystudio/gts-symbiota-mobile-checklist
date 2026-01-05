<template>
    <div class="q-pa-md column q-gutter-sm no-wrap">
        <template v-if="sortBy === 'family'">
            <template v-for="family in taxaArr">
                <div class="full-width column no-wrap">
                    <div class="full-width text-h6 text-bold">
                        {{ family['familyName'] }}
                    </div>
                    <template v-for="taxon in family['taxa']">
                        <div class="q-pl-sm q-mb-xs full-width column">
                            <div class="text-body1">
                                <div class="text-black" @click="openTaxaProfilePopup(taxon['tid']);">
                                    <span class="text-bold text-italic">
                                        {{ taxon['sciname'] }}
                                    </span>
                                    <template v-if="displayAuthors && taxon['author']">
                                        <span class="q-ml-sm text-bold">{{ taxon['author'] }}</span>
                                    </template>
                                </div>
                                <template v-if="displayCommonNames && taxon['vernacularData']">
                                    <span>{{ getVernacularStrFromArr(taxon['vernacularData']) }}</span>
                                </template>
                            </div>
                            <div v-if="displaySynonyms && taxon['synonymyData']" class="q-ml-md text-italic">
                                {{ getSynonymStrFromArr(taxon['synonymyData']) }}
                            </div>
                        </div>
                    </template>
                </div>
            </template>
        </template>
        <template v-else>
            <template v-for="taxon in taxaArr">
                <div class="q-pl-sm q-mb-xs full-width column">
                    <div class="text-body1">
                        <div class="text-black" @click="openTaxaProfilePopup(taxon['tid']);">
                            <span class="text-bold text-italic">
                                {{ taxon['sciname'] }}
                            </span>
                            <template v-if="displayAuthors && taxon['author']">
                                <span class="q-ml-sm text-bold">{{ taxon['author'] }}</span>
                            </template>
                        </div>
                        <template v-if="displayCommonNames && taxon['vernacularData']">
                            <span>{{ getVernacularStrFromArr(taxon['vernacularData']) }}</span>
                        </template>
                    </div>
                    <div v-if="displaySynonyms && taxon['synonymyData']" class="q-ml-md text-italic">
                        {{ getSynonymStrFromArr(taxon['synonymyData']) }}
                    </div>
                </div>
            </template>
        </template>
    </div>
</template>
<script setup>
defineProps({
    displayAuthors: {
        type: Boolean,
        default: false
    },
    displayCommonNames: {
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

function getSynonymStrFromArr(synonymJson) {
    const nameArr = [];
    const synonymArr = JSON.parse(synonymJson);
    if(synonymArr.length > 0){
        synonymArr.forEach(synonym => {
            if(synonym['sciname']){
                nameArr.push(synonym['sciname']);
            }
        });
    }
    return nameArr.length > 0 ? ('[' + nameArr.join(', ') + ']') : '';
}

function getVernacularStrFromArr(vernacularJson) {
    const nameArr = [];
    const vernacularArr = JSON.parse(vernacularJson);
    if(vernacularArr.length > 0){
        vernacularArr.forEach(vernacular => {
            if(vernacular['vernacularname']){
                nameArr.push(vernacular['vernacularname']);
            }
        });
    }
    return nameArr.length > 0 ? (' - ' + nameArr.join(', ')) : '';
}

function openTaxaProfilePopup(tid) {

}
</script>
