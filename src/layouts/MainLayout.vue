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
                <div class="full-width q-px-sm">
                    <selectorInputElement label="Select Checklist" :options="checklistArr" option-label="name" option-value="clid" :value="Number(checklistId) > 0 ? checklistId.toString() : ''" @update:value="processChecklistSelection"></selectorInputElement>
                </div>
                <div v-if="showTopOptions" class="full-width q-px-sm q-pt-sm">
                    <q-card>
                        <q-card-section class="bg-white" style="height: 200px;">

                        </q-card-section>
                    </q-card>
                </div>
                <div role="button" class="q-pa-none q-ma-none full-width row justify-center" :class="!showTopOptions ? '' : 'hidden'" @click="showTopOptions = true">
                    <q-icon color="white" size="lg" name="arrow_drop_down"></q-icon>
                </div>
                <div role="button" class="q-pa-none q-ma-none full-width row justify-center" :class="showTopOptions ? '' : 'hidden'" @click="showTopOptions = false">
                    <q-icon color="white" size="lg" name="arrow_drop_up"></q-icon>
                </div>
            </template>
        </q-header>
        <q-drawer v-model="leftDrawerOpen" behavior="desktop" overlay bordered elevated>
            <div>Panel</div>
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
import 'animate.css';

import { useChecklistStore } from 'src/stores/checklist';

import selectorInputElement from 'src/components/input-elements/selectorInputElement.vue';

import appInformationPopup from 'src/components/popups/appInformationPopup.vue';
import appManagementPopup from 'src/components/popups/appManagementPopup.vue';
import checklistDownloadPopup from 'src/components/popups/checklistDownloadPopup.vue';
import taxonProfilePopup from 'src/components/popups/taxonProfilePopup.vue';

const checklistStore = useChecklistStore();

const checklistArr = computed(() => checklistStore.getChecklistArr);
const checklistId = computed(() => checklistStore.getChecklistId);
const leftDrawerOpen = ref(false);
const showDownloadPopup = ref(false);
const showInformationPopup = ref(false);
const showManagementPopup = ref(false);
const showTaxonProfilePopup = ref(false);
const showTopOptions = ref(false);

function processChecklistSelection(clid: number) {
    checklistStore.setCurrentChecklist(clid);
}

function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value;
}

provide('toggleLeftDrawer', toggleLeftDrawer);
</script>
