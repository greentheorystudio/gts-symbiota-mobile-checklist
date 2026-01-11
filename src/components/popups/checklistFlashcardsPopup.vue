<template>
    <q-dialog v-model="displayPopup" full-width full-height>
        <q-card class="overflow-hidden">
            <q-resize-observer @resize="setCardSize" />
            <q-card-section class="q-pa-none row justify-between q-gutter-sm no-wrap">
                <q-resize-observer @resize="setHeaderSize" />
                <div class="q-py-sm q-pl-sm text-h5 text-bold">Flash Cards</div>
                <div>
                    <q-btn square glossy padding="5px 10px" color="negative" icon="close" @click="closePopup();"></q-btn>
                </div>
            </q-card-section>
            <q-card-section>
                <q-scroll-area :style="scrollerStyle">
                    <div ref="containerRef" class="q-mt-lg full-width row justify-center">
                        <q-card v-if="currentImage" :style="cardStyle">
                            <q-img class="rounded-borders" :height="cardImageHeight" :src="(currentImage['url'].startsWith('/') ? (clientRoot + currentImage['url']) : currentImage['url'])" fit="scale-down" :no-native-menu="true"></q-img>
                            <q-card-section class="q-pa-sm column q-gutter-sm">
                                <div class="row justify-between">
                                    <div>
                                        <q-btn color="primary" @click="setCurrentTaxon();" label="Skip" tabindex="0" />
                                    </div>
                                    <div class="row justify-end q-gutter-xs">
                                        <q-btn round dense color="primary" text-color="white" icon="arrow_left" @click="currentImageIndex--" :disabled="currentImageIndex === 0" aria-label="Previous image" tabindex="0">
                                            <q-tooltip anchor="center right" self="center left" class="text-body2" :delay="1000" :offset="[10, 10]">
                                                Previous image
                                            </q-tooltip>
                                        </q-btn>
                                        <q-btn round dense color="primary" text-color="white" icon="arrow_right" @click="currentImageIndex++" :disabled="(currentImageIndex + 1) === checklistImageData[currentTaxon['tidaccepted']].length" aria-label="Next image" tabindex="0">
                                            <q-tooltip anchor="center right" self="center left" class="text-body2" :delay="1000" :offset="[10, 10]">
                                                Next image
                                            </q-tooltip>
                                        </q-btn>
                                    </div>
                                </div>
                                <div v-if="displayCommonNamesVal && currentTaxon['vernacularData'] && currentTaxon['vernacularData'].length > 0" class="text-body1">
                                    <span class="text-bold">Common names: </span>{{ getVernacularStrFromArr(currentTaxon['vernacularData']) }}
                                </div>
                                <div class="row">
                                    <div class="col-grow">
                                        <singleScientificCommonNameAutoComplete :sciname="(familyAnswer ? familyAnswer.sciname : null)" :options="familyAnswerOptions" label="Family" :limit-to-options="true" @update:sciname="processFamilyAnswerChange"></singleScientificCommonNameAutoComplete>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-grow">
                                        <singleScientificCommonNameAutoComplete :sciname="(scinameAnswer ? scinameAnswer.sciname : null)" :options="scinameAnswerOptions" label="Scientific Name" :limit-to-options="true" @update:sciname="processScinameAnswerChange"></singleScientificCommonNameAutoComplete>
                                    </div>
                                </div>
                                <div class="row justify-between">
                                    <div>
                                        <q-btn color="negative" @click="showCurrentTaxon();" label="Show Me" tabindex="0" />
                                    </div>
                                    <div>
                                        <q-btn color="primary" @click="checkAnswers();" label="Check Answer" :disabled="!scinameAnswer && !familyAnswer" tabindex="0" />
                                    </div>
                                </div>
                            </q-card-section>
                        </q-card>
                    </div>
                </q-scroll-area>
            </q-card-section>
        </q-card>
    </q-dialog>
    <q-dialog class="z-top" v-model="displayInstructionsPopup" persistent>
        <q-card class="sm-popup">
            <div class="row justify-end items-start map-sm-popup">
                <div>
                    <q-btn square dense color="red" text-color="white" icon="fas fa-times" @click="displayInstructionsPopup = false" aria-label="Close Instructions" tabindex="0"></q-btn>
                </div>
            </div>
            <div class="q-pa-md text-body1">
                Enter the scientific name and family of the species in the image.
                Click the previous and next image buttons to scroll through the images for the current taxon.
                Click the skip button to skip to the next taxon. Click the Show Me button to give up and open the
                taxon profile page to show the current taxon. 1 point will be awarded for each correct scientific
                name and family answer.
            </div>
        </q-card>
    </q-dialog>
</template>
<script setup>
import { computed, onMounted, ref, toRefs, watch } from 'vue';

import { useChecklistStore } from 'src/stores/checklist';

import singleScientificCommonNameAutoComplete from 'src/components/input-elements/singleScientificCommonNameAutoComplete.vue';

const checklistStore = useChecklistStore();

const props = defineProps({
    showPopup: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close:popup']);

const cardHeight = ref(0);
const cardWidth = ref(0);
const displayPopup = ref(false);
const headerHeight = ref(0);
const propsRefs = toRefs(props);
const scrollerStyle = computed(() => {
    return 'width: ' + (cardWidth.value - 30) + 'px;height: ' + (cardHeight.value - headerHeight.value) + 'px;';
});

watch(propsRefs.showPopup, () => {
    setDisplayValue();
});

function closePopup() {
    emit('close:popup');
}

function setCardSize(cardSize) {
    cardHeight.value = cardSize.height;
    cardWidth.value = cardSize.width;
}

function setDisplayValue() {
    displayPopup.value = props.showPopup;
}

function setHeaderSize(headerSize) {
    headerHeight.value = headerSize.height;
}

onMounted(() => {
    setDisplayValue();
});
</script>
