<template>
    <q-layout view="hHh lpR fFf">
        <q-header elevated>
            <q-toolbar>
                <q-toolbar-title>
                    <div class="cursor-pointer">
                        Symbiota Mobile Checklist
                    </div>
                </q-toolbar-title>
                <div class="row q-gutter-sm">
                    <q-btn flat dense round icon="download_for_offline" aria-label="Download" @click="showDownloadPopup = true" />
                    <q-btn flat dense round icon="settings" aria-label="Management" @click="showManagementPopup = true" />
                    <q-btn flat dense round icon="info" aria-label="Help" @click="showInformationPopup = true" />
                </div>
            </q-toolbar>
            <template v-if="checklistArr.length > 0">
                <div v-touch-swipe.mouse="handleTopSwipe">
                    <div class="q-px-sm">
                        <selectorInputElement label="Select Checklist" :options="checklistArr" option-label="name" option-value="clid" :value="Number(checklistId) > 0 ? checklistId.toString() : ''" @update:value="processChecklistSelection"></selectorInputElement>
                    </div>
                    <div class="q-mt-sm q-pl-sm">
                        <q-slide-transition class="q-px-sm q-pt-sm">
                            <div v-show="showTopOptions" class="q-px-sm q-pt-sm">
                                <q-card>
                                    <q-card-section class="bg-white q-pa-sm column q-gutter-sm">
                                        <div class="q-px-sm">
                                            <selectorInputElement label="Sort Taxa" :options="displaySortByOptions" :value="selectedSortByOption" @update:value="processSortByChange"></selectorInputElement>
                                        </div>
                                        <div class="q-px-sm">
                                            <singleScientificCommonNameAutoComplete :sciname="(taxonFilterVal ? taxonFilterVal.sciname : null)" :options="taxaFilterOptions" label="Taxon Filter" :limit-to-options="true" @update:sciname="processTaxonFilterValChange"></singleScientificCommonNameAutoComplete>
                                        </div>
                                        <div class="row q-gutter-sm">
                                            <div class="text-black q-mr-md text-body1 text-bold">
                                                Display:
                                            </div>
                                            <div class="text-black text-bold">
                                                <checkboxInputElement label="Synonyms" :value="Number(displaySynonymsVal).toString()" @update:value="processDisplaySynonymsChange"></checkboxInputElement>
                                            </div>
                                            <div class="text-black text-bold">
                                                <checkboxInputElement label="Common Names" :value="Number(displayCommonNamesVal).toString()" @update:value="processDisplayCommonNameChange"></checkboxInputElement>
                                            </div>
                                            <div class="text-black text-bold">
                                                <checkboxInputElement label="Images" :value="Number(displayImagesVal).toString()" @update:value="processDisplayImagesChange"></checkboxInputElement>
                                            </div>
                                            <div class="text-black text-bold">
                                                <checkboxInputElement label="Taxon Authors" :value="Number(displayAuthorsVal).toString()" @update:value="processDisplayAuthorsChange"></checkboxInputElement>
                                            </div>
                                        </div>
                                    </q-card-section>
                                </q-card>
                            </div>
                        </q-slide-transition>
                    </div>
                    <div role="button" class="q-pa-none q-ma-none row justify-center" :class="!showTopOptions ? '' : 'hidden'" @click="showTopOptions = true">
                        <q-icon color="white" size="lg" name="arrow_drop_down"></q-icon>
                    </div>
                    <div role="button" class="q-pa-none q-ma-none row justify-center" :class="showTopOptions ? '' : 'hidden'" @click="showTopOptions = false">
                        <q-icon color="white" size="lg" name="arrow_drop_up"></q-icon>
                    </div>
                </div>
            </template>
        </q-header>
        <q-drawer v-if="keyDataExists" v-model="leftDrawerOpen" :width="400" behavior="desktop" class="hide-scrollbar" overlay bordered elevated>
            <div class="q-py-md q-pl-md q-pr-lg">
                <identificationKeyModule></identificationKeyModule>
            </div>
            <div class="q-mini-drawer-hide absolute" style="top: calc(50% - 30px); right: 0" @click="toggleLeftDrawer">
                <q-btn square padding="25px 0" color="primary" icon="arrow_left"></q-btn>
            </div>
        </q-drawer>
        <q-page-container>
            <router-view />
            <appInformationPopup
                :show-popup="showInformationPopup"
                @close:popup="showInformationPopup = false"
            ></appInformationPopup>
            <appManagementPopup
                :show-popup="showManagementPopup"
                @close:popup="showManagementPopup = false"
            ></appManagementPopup>
            <checklistDownloadPopup
                :show-popup="showDownloadPopup"
                @close:popup="showDownloadPopup = false"
            ></checklistDownloadPopup>
            <taxonProfilePopup
                :show-popup="showTaxonProfilePopup"
                @close:popup="showTaxonProfilePopup = false"
            ></taxonProfilePopup>
        </q-page-container>
    </q-layout>
</template>
<script setup lang="ts">
import { computed, provide, ref } from 'vue';

import { useChecklistStore } from 'src/stores/checklist';

import checkboxInputElement from 'src/components/input-elements/checkboxInputElement.vue';
import selectorInputElement from 'src/components/input-elements/selectorInputElement.vue';
import singleScientificCommonNameAutoComplete from 'src/components/input-elements/singleScientificCommonNameAutoComplete.vue';

import identificationKeyModule from 'src/components/layout/identificationKeyModule.vue';

import appInformationPopup from 'src/components/popups/appInformationPopup.vue';
import appManagementPopup from 'src/components/popups/appManagementPopup.vue';
import checklistDownloadPopup from 'src/components/popups/checklistDownloadPopup.vue';
import taxonProfilePopup from 'src/components/popups/taxonProfilePopup.vue';

const checklistStore = useChecklistStore();

const checklistArr = computed(() => checklistStore.getChecklistArr);
const checklistId = computed(() => checklistStore.getChecklistId);
const displayAuthorsVal = computed(() => checklistStore.getDisplayAuthors);
const displayCommonNamesVal = computed(() => checklistStore.getDisplayVernaculars);
const displayImagesVal = computed(() => checklistStore.getDisplayImages);
const displaySortByOptions: any[] = [
    {value: 'family', label: 'Family/Scientific Name'},
    {value: 'sciname', label: 'Scientific Name'}
];
const displaySynonymsVal = computed(() => checklistStore.getDisplaySynonyms);
const keyDataExists = computed(() => checklistStore.getKeyDataExists);
const leftDrawerOpen = ref(false);
const selectedSortByOption = computed(() => checklistStore.getDisplaySortVal);
const showDownloadPopup = ref(false);
const showInformationPopup = ref(false);
const showManagementPopup = ref(false);
const showTaxonProfilePopup = ref(false);
const showTopOptions = ref(false);
const taxaFilterOptions = computed(() => checklistStore.getTaxaFilterOptions);
const taxonFilterVal = computed(() => checklistStore.getDisplayTaxonFilterVal);

function handleTopSwipe ({ evt, ...newInfo }: any) {
    if(newInfo && newInfo.hasOwnProperty('direction')){
        if(newInfo.direction === 'down'){
            showTopOptions.value = true;
        }
        else if(newInfo.direction === 'up'){
            showTopOptions.value = false;
        }
    }
}

function processChecklistSelection(clid: number) {
    checklistStore.setCurrentChecklist(clid);
}

function processDisplayAuthorsChange(value: boolean) {
    checklistStore.setDisplayAuthors(Number(value) === 1);
}

function processDisplayCommonNameChange(value: boolean) {
    checklistStore.setDisplayVernaculars(Number(value) === 1);
}

function processDisplayImagesChange(value: boolean) {
    checklistStore.setDisplayImages(Number(value) === 1);
}

function processDisplaySynonymsChange(value: boolean) {
    checklistStore.setDisplaySynonyms(Number(value) === 1);
}

function processSortByChange(value: string) {
    checklistStore.setDisplaySortVal(value);
    checklistStore.setPaginationPage(1);
}

function processTaxonFilterValChange(taxon: any) {
    checklistStore.setDisplayTaxonFilterVal(taxon);
    checklistStore.setPaginationPage(1);
}

function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value;
}

provide('toggleLeftDrawer', toggleLeftDrawer);
</script>
