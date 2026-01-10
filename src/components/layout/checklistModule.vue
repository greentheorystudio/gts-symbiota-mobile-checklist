<template>
    <div class="fit column">
        <div class="q-pa-xs row justify-between q-gutter-sm items-center">
            <div>
                <div class="text-h5 text-bold">{{ checklistData ? checklistData['name'] : '' }}</div>
            </div>
            <div class="row justify-end items-center q-gutter-sm">
                <q-btn dense round icon="style" @click=""></q-btn>
                <q-btn dense round icon="info" @click="openChecklistInfoPopup(checklistData)"></q-btn>
            </div>
        </div>
        <div class="q-mb-sm full-width">
            <q-separator></q-separator>
        </div>
        <div class="q-mb-xs full-width row justify-start q-gutter-xs">
            <div class="text-body1">
                <span class="text-bold">Families: </span>{{ countData['families'] }}
            </div>
            <div class="text-body1">
                <span class="text-bold">Genera: </span>{{ countData['genera'] }}
            </div>
            <div class="text-body1">
                <span class="text-bold">Species: </span>{{ countData['species'] }}
            </div>
            <div class="text-body1">
                <span class="text-bold">Taxa: </span>{{ countData['total'] }}
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
        <div class="q-pa-md column">
            <div class="q-pl-md">
                <template v-if="displayImagesVal">
                    <taxaImageDisplayModule
                        :display-authors="displayAuthorsVal"
                        :display-common-names="displayCommonNamesVal"
                        :display-notes="displayNotesVal"
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
                        :display-notes="displayNotesVal"
                        :display-synonyms="displaySynonymsVal"
                        :sort-by="selectedSortByOption"
                        :taxa-arr="taxaDisplayDataArr"
                    ></taxaListDisplayModule>
                </template>
            </div>
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
    </div>
</template>
<script setup lang="ts">
import { computed, inject, Ref, ref, watch } from 'vue';

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
const displayNotesVal = computed(() => checklistStore.getDisplayNotes);
const displaySynonymsVal = computed(() => checklistStore.getDisplaySynonyms);
const paginationLastPageNumber = computed(() => checklistStore.getPaginationLastPageNumber);
const paginationPageValue: Ref<number> = ref(1);
const selectedSortByOption = computed(() => checklistStore.getDisplaySortVal);
const taxaDisplayDataArr = computed(() => checklistStore.getTaxaDisplayDataArr);
const taxaPerPage = computed(() => checklistStore.getTaxaPerPage);

const openChecklistInfoPopup: any = inject('openChecklistInfoPopup');

watch(paginationPageValue, () => {
    checklistStore.setPaginationPage(paginationPageValue.value);
});
</script>
