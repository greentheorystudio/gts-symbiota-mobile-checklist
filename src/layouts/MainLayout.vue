<template>
    <q-layout view="hHh lpR fFf">
        <q-resize-observer @resize="setWindowSize" />
        <q-header elevated :class="checklistArr.length === 0 ? 'q-pb-sm' : ''">
            <q-resize-observer @resize="setHeaderSize" />
            <q-toolbar>
                <q-toolbar-title class="text-h6 text-bold">
                    Symbiota Mobile Checklist
                </q-toolbar-title>
                <div class="row q-gutter-sm">
                    <q-btn v-if="remoteConnectionEstablished" dense round icon="download_for_offline" aria-label="Download" @click="showDownloadPopup = true" />
                    <q-btn dense round icon="settings" aria-label="Management" @click="showManagementPopup = true" />
                    <q-btn dense round icon="help" aria-label="Help" @click="showInformationPopup = true" />
                </div>
            </q-toolbar>
            <template v-if="checklistArr.length > 0">
                <div v-touch-swipe.mouse="handleTopSwipe">
                    <div>
                        <q-slide-transition class="q-pl-sm q-pr-xs q-pt-xs">
                            <div v-show="showTopOptions">
                                <q-card>
                                    <q-card-section class="bg-white q-pl-none q-pr-xs q-pt-xs q-pb-sm column q-col-gutter-xs">
                                        <div>
                                            <selectorInputElement label="Select Checklist" :options="checklistArr" option-label="name" option-value="clid" :value="Number(checklistId) > 0 ? checklistId.toString() : ''" @update:value="processChecklistSelection"></selectorInputElement>
                                        </div>
                                        <template v-if="Number(checklistId) > 0">
                                            <div class="q-px-xs">
                                                <selectorInputElement label="Sort Taxa" :options="displaySortByOptions" :value="selectedSortByOption" @update:value="processSortByChange"></selectorInputElement>
                                            </div>
                                            <div class="q-px-xs">
                                                <singleScientificCommonNameAutoComplete :sciname="(taxonFilterVal ? taxonFilterVal.sciname : null)" :options="taxaFilterOptions" label="Taxon Filter" :limit-to-options="true" @update:sciname="processTaxonFilterValChange"></singleScientificCommonNameAutoComplete>
                                            </div>
                                            <div class="row q-gutter-xs">
                                                <div class="text-black q-mr-sm text-body1 text-bold">
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
                                                <div class="text-black text-bold">
                                                    <checkboxInputElement label="Notes" :value="Number(displayNotesVal).toString()" @update:value="processDisplayNotesChange"></checkboxInputElement>
                                                </div>
                                            </div>
                                        </template>
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
        <q-drawer v-if="keyDataExists" v-model="leftDrawerOpen" :width="325" behavior="desktop" class="q-py-md hide-scrollbar" overlay bordered elevated>
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
            <template v-if="remoteConnectionEstablished">
                <checklistDownloadPopup
                    :show-popup="showDownloadPopup"
                    @close:popup="showDownloadPopup = false"
                ></checklistDownloadPopup>
            </template>
            <checklistFlashcardsPopup
                :show-popup="showFlashcardPopup"
                @close:popup="closeChecklistFlashcardPopup()"
            ></checklistFlashcardsPopup>
            <checklistInformationPopup
                :checklist="checklistInfoData"
                :show-popup="showChecklistInfoPopup"
                @close:popup="closeChecklistInfoPopup()"
            ></checklistInformationPopup>
            <taxonProfilePopup
                :flashcard="flashcardTaxonProfile"
                :taxon="taxonProfileData"
                :show-popup="showTaxonProfilePopup"
                @close:popup="closeTaxonProfilePopup()"
            ></taxonProfilePopup>
        </q-page-container>
    </q-layout>
</template>
<script setup>
import {computed, onMounted, provide, ref, watch} from 'vue';

import { useChecklistStore } from 'src/stores/checklist';
import { useChecklistRemoteStore } from 'src/stores/checklist-remote';

import checkboxInputElement from 'src/components/input-elements/checkboxInputElement.vue';
import selectorInputElement from 'src/components/input-elements/selectorInputElement.vue';
import singleScientificCommonNameAutoComplete from 'src/components/input-elements/singleScientificCommonNameAutoComplete.vue';

import identificationKeyModule from 'src/components/layout/identificationKeyModule.vue';

import appInformationPopup from 'src/components/popups/appInformationPopup.vue';
import appManagementPopup from 'src/components/popups/appManagementPopup.vue';
import checklistDownloadPopup from 'src/components/popups/checklistDownloadPopup.vue';
import checklistFlashcardsPopup from 'src/components/popups/checklistFlashcardsPopup.vue';
import checklistInformationPopup from 'src/components/popups/checklistInformationPopup.vue';
import taxonProfilePopup from 'src/components/popups/taxonProfilePopup.vue';

const checklistStore = useChecklistStore();
const checklistRemoteStore = useChecklistRemoteStore();

const checklistArr = computed(() => checklistStore.getChecklistArr);
const checklistId = computed(() => checklistStore.getChecklistId);
const checklistInfoData = ref(null);
const displayAuthorsVal = computed(() => checklistStore.getDisplayAuthors);
const displayCommonNamesVal = computed(() => checklistStore.getDisplayVernaculars);
const displayImagesVal = computed(() => checklistStore.getDisplayImages);
const displayNotesVal = computed(() => checklistStore.getDisplayNotes);
const displaySortByOptions = [
    {value: 'family', label: 'Family/Scientific Name'},
    {value: 'sciname', label: 'Scientific Name'}
];
const displaySynonymsVal = computed(() => checklistStore.getDisplaySynonyms);
const flashcardTaxonProfile = ref(false);
const headerHeight = ref(0);
const keyDataExists = computed(() => checklistStore.getKeyDataExists);
const leftDrawerOpen = ref(false);
const remoteConnectionEstablished = computed(() => checklistRemoteStore.getRemoteConnectionEstablished);
const selectedSortByOption = computed(() => checklistStore.getDisplaySortVal);
const showChecklistInfoPopup = ref(false);
const showDownloadPopup = ref(false);
const showFlashcardPopup = ref(false);
const showInformationPopup = ref(false);
const showManagementPopup = ref(false);
const showTaxonProfilePopup = ref(false);
const showTopOptions = ref(false);
const taxaFilterOptions = computed(() => checklistStore.getTaxaFilterOptions);
const taxonFilterVal = computed(() => checklistStore.getDisplayTaxonFilterVal);
const taxonProfileData = ref(null);
const windowHeight = ref(0);
const windowWidth = ref(0);

function closeChecklistFlashcardPopup() {
    showFlashcardPopup.value = false;
}

function closeChecklistInfoPopup() {
    checklistInfoData.value = null;
    showChecklistInfoPopup.value = false;
}

function closeTaxonProfilePopup() {
    taxonProfileData.value = null;
    showTaxonProfilePopup.value = false;
}

function handleTopSwipe ({ evt, ...newInfo }) {
    if(newInfo && newInfo.hasOwnProperty('direction')){
        if(newInfo.direction === 'down'){
            showTopOptions.value = true;
        }
        else if(newInfo.direction === 'up'){
            showTopOptions.value = false;
        }
    }
}

function openChecklistFlashcardPopup() {
    showFlashcardPopup.value = true;
}

function openChecklistInfoPopup(checklist) {
    checklistInfoData.value = checklist;
    showChecklistInfoPopup.value = true;
}

function openTaxonProfilePopup(taxon, flashcard = false) {
    flashcardTaxonProfile.value = flashcard;
    taxonProfileData.value = taxon;
    showTaxonProfilePopup.value = true;
}

function processChecklistSelection(clid) {
    checklistStore.setCurrentChecklist(clid);
}

function processDisplayAuthorsChange(value) {
    checklistStore.setDisplayAuthors(Number(value) === 1);
}

function processDisplayCommonNameChange(value) {
    checklistStore.setDisplayVernaculars(Number(value) === 1);
}

function processDisplayImagesChange(value) {
    checklistStore.setDisplayImages(Number(value) === 1);
}

function processDisplayNotesChange(value) {
    checklistStore.setDisplayNotes(Number(value) === 1);
}

function processDisplaySynonymsChange(value) {
    checklistStore.setDisplaySynonyms(Number(value) === 1);
}

async function processSortByChange(value) {
    checklistStore.setDisplaySortVal(value);
    checklistStore.setPaginationPage(1);
    await checklistStore.setImageContentData();
}

async function processTaxonFilterValChange(taxon) {
    checklistStore.setDisplayTaxonFilterVal(taxon);
    checklistStore.setPaginationPage(1);
    await checklistStore.setImageContentData();
}

function setHeaderSize(headerSize) {
    headerHeight.value = headerSize.height;
}

function setWindowSize(windowSize) {
    windowHeight.value = windowSize.height;
    windowWidth.value = windowSize.width;
}

function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value;
}

provide('headerHeight', headerHeight);
provide('openChecklistFlashcardPopup', openChecklistFlashcardPopup);
provide('openChecklistInfoPopup', openChecklistInfoPopup);
provide('openTaxonProfilePopup', openTaxonProfilePopup);
provide('toggleLeftDrawer', toggleLeftDrawer);
provide('windowHeight', windowHeight);
provide('windowWidth', windowWidth);

onMounted(() => {
    if(checklistArr.value.length > 0){
        showTopOptions.value = true;
    }
    else if(checklistArr.value.length > 0){
        showDownloadPopup.value = true;
    }
});
</script>
