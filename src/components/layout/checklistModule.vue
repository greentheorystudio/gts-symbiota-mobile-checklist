<template>
    <div class="fit q-pa-md column">
        <div class="q-mb-md full-width row justify-between q-gutter-sm items-center">
            <div>
                <h1>{{ checklistData ? checklistData['name'] : '' }}</h1>
            </div>
            <div class="row justify-end items-center">
                <q-btn text-color="black" size="sm" icon="fas fa-gamepad" dense unelevated :ripple="false" aria-label="Open Flashcard Game" tabindex="0">
                    <q-tooltip anchor="top middle" self="bottom middle" class="text-body2" :delay="1000" :offset="[10, 10]">
                        Open Flashcard Game
                    </q-tooltip>
                </q-btn>
            </div>
        </div>
        <div class="q-mb-sm full-width">
            <q-separator></q-separator>
        </div>
        <div class="q-mb-xs full-width row justify-start q-gutter-sm">
            <div class="text-body1">
                <span class="text-bold q-mr-sm">Families: </span>{{ countData['families'] }}
            </div>
            <div class="text-body1">
                <span class="text-bold q-mr-sm">Genera: </span>{{ countData['genera'] }}
            </div>
            <div class="text-body1">
                <span class="text-bold q-mr-sm">Species: </span>{{ countData['species'] }}
            </div>
            <div class="text-body1">
                <span class="text-bold q-mr-sm">Total Taxa: </span>{{ countData['total'] }}
            </div>
        </div>
        <div class="q-mb-sm full-width">
            <q-separator></q-separator>
        </div>
        <template v-if="activeTaxaArr.length > taxaPerPage">
            <div class="q-mb-sm q-px-md full-width row justify-end">
                <q-pagination v-model="paginationPageValue" :max="paginationLastPageNumber" direction-links flat color="grey" active-color="primary" max-pages="10" aria-label="Checklist page navigation"></q-pagination>
            </div>
            <div class="q-mb-sm full-width">
                <q-separator></q-separator>
            </div>
        </template>
        <template v-if="displayImagesVal">
            <taxaImageDisplayModule
                :display-authors="displayAuthorsVal"
                :display-common-names="displayCommonNamesVal"
                :display-synonyms="displaySynonymsVal"
                :image-data="checklistImageData"
                :sort-by="selectedSortByOption"
                :taxa-arr="taxaDisplayDataArr"
            ></taxaImageDisplayModule>
        </template>
        <template v-else>
            <taxaListDisplayModule
                :display-authors="displayAuthorsVal"
                :display-common-names="displayCommonNamesVal"
                :display-synonyms="displaySynonymsVal"
                :sort-by="selectedSortByOption"
                :taxa-arr="taxaDisplayDataArr"
            ></taxaListDisplayModule>
        </template>
        <template v-if="activeTaxaArr.length > taxaPerPage">
            <div class="q-mb-sm full-width">
                <q-separator></q-separator>
            </div>
            <div class="q-mb-sm q-px-md full-width row justify-end">
                <q-pagination v-model="paginationPageValue" :max="paginationLastPageNumber" direction-links flat color="grey" active-color="primary" max-pages="10" aria-label="Checklist page navigation"></q-pagination>
            </div>
            <div class="q-mb-sm full-width">
                <q-separator></q-separator>
            </div>
        </template>
    </div>
</template>
<script setup lang="ts">
import {computed, Ref, ref, watch} from 'vue';

import { useChecklistStore } from 'src/stores/checklist';

import taxaImageDisplayModule from 'src/components/layout/taxaImageDisplayModule.vue';
import taxaListDisplayModule from 'src/components/layout/taxaListDisplayModule.vue';

const checklistStore = useChecklistStore();

const activeTaxaArr = computed(() => checklistStore.getActiveTaxaArr);
const checklistData = computed(() => checklistStore.getChecklistData);
const countData = computed(() => checklistStore.getCountData);
const checklistImageData = computed(() => checklistStore.getImageContentData);
const displayAuthorsVal = computed(() => checklistStore.getDisplayAuthors);
const displayCommonNamesVal = computed(() => checklistStore.getDisplayVernaculars);
const displayImagesVal = computed(() => checklistStore.getDisplayImages);
const displaySynonymsVal = computed(() => checklistStore.getDisplaySynonyms);
const paginationLastPageNumber = computed(() => checklistStore.getPaginationLastPageNumber);
const paginationPageValue: Ref<number> = ref(1);
const selectedSortByOption = computed(() => checklistStore.getDisplaySortVal);
const taxaDisplayDataArr = computed(() => checklistStore.getTaxaDisplayDataArr);
const taxaPerPage = computed(() => checklistStore.getTaxaPerPage);

watch(paginationPageValue, () => {
    checklistStore.setPaginationPage(paginationPageValue.value);
});
</script>
