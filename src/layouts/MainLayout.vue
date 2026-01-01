<template>
    <q-layout view="hHh lpR fFf">
        <q-header elevated>
            <q-toolbar>
                <q-toolbar-title>
                    <div class="cursor-pointer" @click="$router.push('/');">
                        Symbiota Mobile Checklist
                    </div>
                </q-toolbar-title>

                <div class="row q-gutter-sm">
                    <q-btn flat dense round icon="download_for_offline" aria-label="Download" @click="showDownloadPopup = true" />
                    <q-btn flat dense round icon="settings" aria-label="Management" @click="showManagementPopup = true" />
                    <q-btn flat dense round icon="info" aria-label="Help" @click="showInformationPopup = true" />
                </div>
            </q-toolbar>
        </q-header>

        <q-drawer v-model="leftDrawerOpen" bordered>

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
import { computed, ref } from 'vue';

import { useChecklistStore } from 'src/stores/checklist';

import appInformationPopup from 'src/components/popups/appInformationPopup.vue';
import appManagementPopup from 'src/components/popups/appManagementPopup.vue';
import checklistDownloadPopup from 'src/components/popups/checklistDownloadPopup.vue';
import taxonProfilePopup from 'src/components/popups/taxonProfilePopup.vue';

const checklistStore = useChecklistStore();

const checklistArr = computed(() => checklistStore.getChecklistArr);
const leftDrawerOpen = ref(false);
const showDownloadPopup = ref(false);
const showInformationPopup = ref(false);
const showManagementPopup = ref(false);
const showTaxonProfilePopup = ref(false);

function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
