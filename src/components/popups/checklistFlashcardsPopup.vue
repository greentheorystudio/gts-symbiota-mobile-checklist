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
                    <div class="q-py-sm column">
                        <div class="row justify-start q-gutter-md">
                            <div>
                                <span class="q-mr-sm text-h6 text-bold">Correct:</span><span class="text-h6">{{ correctTidArr.length }}</span>
                            </div>
                            <div>
                                <span class="q-mr-sm text-h6 text-bold">Incorrect:</span><span class="text-h6">{{ incorrectTidArr.length }}</span>
                            </div>
                            <div>
                                <span class="q-mr-sm text-h6 text-bold">Points:</span><span class="text-h6">{{ points }}</span>
                            </div>
                        </div>
                        <div class="row justify-end q-gutter-sm">
                            <div>
                                <q-btn size="md" icon="help" stretch flat dense :ripple="false" @click="openFlashcardHelp()"></q-btn>
                            </div>
                            <div>
                                <q-btn color="negative" @click="resetGame();" label="Reset" tabindex="0" />
                            </div>
                        </div>
                    </div>
                    <div class="q-mb-sm full-width">
                        <q-separator></q-separator>
                    </div>
                    <div class="q-my-lg full-width row justify-center">
                        <q-card v-if="currentImage" :style="cardStyle">
                            <q-img class="rounded-borders" :height="cardImageHeight" :src="currentImage['contentData']" fit="contain" :no-native-menu="true"></q-img>
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
                                        <q-btn round dense color="primary" text-color="white" icon="arrow_right" @click="currentImageIndex++" :disabled="(currentImageIndex + 1) === checklistImageData[currentTaxon['tid']].length" aria-label="Next image" tabindex="0">
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
                    <q-btn square glossy padding="5px 10px" color="negative" icon="close" @click="closeFlashcardHelp();"></q-btn>
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
import {computed, inject, onMounted, ref, toRefs, watch} from 'vue';
import { useQuasar } from 'quasar';

import {
    hideWorking,
    showWorking
} from 'src/hooks/core';

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

const $q = useQuasar();

const cardDimensions = computed(() => {
    let returnVal = 0;
    if(cardWidth.value > 0){
        /*if(cardWidth.value > 900){
            returnVal = (cardWidth.value * 0.5);
        }
        else if(cardWidth.value > 600){
            returnVal = (cardWidth.value * 0.6);
        }
        else if(cardWidth.value > 400){
            returnVal = (cardWidth.value * 0.7);
        }
        else{
            returnVal = cardWidth.value * 0.8;
        }*/
        returnVal = cardWidth.value * 0.9;
    }
    return returnVal;
});
const cardHeight = ref(0);
const cardImageHeight = computed(() => {
    return cardDimensions.value + 'px';
});
const cardStyle = computed(() => {
    return 'width: ' + cardDimensions.value + 'px;';
});
const cardWidth = ref(0);
const checklistImageData = computed(() => checklistStore.getFlashcardImageContentData);
const correctTidArr = ref([]);
const currentImage = computed(() => {
    return currentTaxon.value ? checklistImageData.value[currentTaxon.value['tid'].toString()][Number(currentImageIndex.value)] : null;
});
const currentImageIndex = ref(0);
const currentTaxon = ref(null);
const displayCommonNamesVal = computed(() => checklistStore.getDisplayVernaculars);
const displayInstructionsPopup = ref(false);
const displayPopup = ref(false);
const familyAnswer = ref(null);
const familyAnswerOptions = computed(() => {
    const returnArr = [];
    unusedTaxaArr.value.forEach(taxon => {
        const familyObj = returnArr.find(family => family['sciname'] === taxon['family']);
        if(!familyObj){
            returnArr.push({
                sciname: taxon['family'],
                label: taxon['family']
            });
        }
    });
    returnArr.sort((a, b) => {
        return a['sciname'].localeCompare(b['sciname']);
    });
    return returnArr;
});
const headerHeight = ref(0);
const incorrectTidArr = ref([]);
const points = ref(0);
const propsRefs = toRefs(props);
const scinameAnswer = ref(null);
const scinameAnswerOptions = computed(() => {
    const returnArr = [];
    unusedTaxaArr.value.forEach(taxon => {
        returnArr.push({
            sciname: taxon['sciname'],
            label: taxon['sciname'],
            family: taxon['family'],
            tid: taxon['tid']
        });
    });
    returnArr.sort((a, b) => {
        return a['sciname'].localeCompare(b['sciname']);
    });
    return returnArr;
});
const scrollerStyle = computed(() => {
    return 'width: ' + (cardWidth.value - 30) + 'px;height: ' + (cardHeight.value - headerHeight.value) + 'px;';
});
const taxaDataArr = computed(() => checklistStore.getChecklistFlashcardTaxaArr);
const unusedTaxaArr = computed(() => {
    const returnArr = [];
    taxaDataArr.value.forEach(taxon => {
        if(!correctTidArr.value.includes(Number(taxon['tid'])) && !incorrectTidArr.value.includes(Number(taxon['tid']))){
            returnArr.push(taxon);
        }
    });
    return returnArr;
});

const openTaxonProfilePopup = inject('openTaxonProfilePopup');

watch(propsRefs.showPopup, async () => {
    setDisplayValue();
    if(props.showPopup){
        showWorking();
        await checklistStore.setFlashcardImageContentData();
        hideWorking();
        setCurrentTaxon();
    }
});

function checkAnswers() {
    let newPoints = 0;
    let message = '';
    if(scinameAnswer.value && scinameAnswer.value['sciname'] === currentTaxon.value['sciname']){
        if(familyAnswer.value && familyAnswer.value['sciname'] === currentTaxon.value['family']){
            message = 'Excellent work! You have both the scientific name and family correct. You earned 2 points!';
            newPoints += 2;
        }
        else{
            message = 'Good job! You have the scientific name correct. The correct family is ' + currentTaxon.value['family'] + '. You earned 1 point!';
            newPoints++;
        }
        correctTidArr.value.push(Number(currentTaxon.value['tid']));
        showAnswerNotification(true, message);
    }
    else{
        if(familyAnswer.value && familyAnswer.value['sciname'] === currentTaxon.value['family']){
            if(scinameAnswer.value){
                message = 'The scientific name you entered is incorrect. ';
            }
            message += 'The correct scientific name is ' + currentTaxon.value['sciname'] + '. You did get the family correct however. You earned 1 point!';
            newPoints++;
        }
        else{
            message = 'Unfortunately your answer is incorrect. The correct scientific name is ' + currentTaxon.value['sciname'] + ', and the family is ' + currentTaxon.value['family'] + '.';
        }
        incorrectTidArr.value.push(Number(currentTaxon.value['tid']));
        showAnswerNotification(false, message);
    }
    points.value += newPoints;
    setCurrentTaxon();
}

function closeFlashcardHelp() {
    displayInstructionsPopup.value = false;
    setDisplayValue();
}

function closePopup() {
    emit('close:popup');
}

function getVernacularStrFromArr(vernacularArr) {
    const nameArr = [];
    vernacularArr.forEach(vernacular => {
        if(vernacular['vernacularname']){
            nameArr.push(vernacular['vernacularname']);
        }
    });
    return nameArr.length > 0 ? nameArr.join(', ') : '';
}

function openFlashcardHelp() {
    displayInstructionsPopup.value = true;
    setDisplayValue();
}

function processFamilyAnswerChange(value) {
    familyAnswer.value = value;
}

function processScinameAnswerChange(value) {
    scinameAnswer.value = value;
}

function resetGame() {
    correctTidArr.value.length = 0;
    incorrectTidArr.value.length = 0;
    points.value = 0;
    setCurrentTaxon();
}

function setCardSize(cardSize) {
    cardHeight.value = cardSize.height;
    cardWidth.value = cardSize.width;
}

function setCurrentTaxon() {
    scinameAnswer.value = null;
    familyAnswer.value = null;
    currentImageIndex.value = 0;
    currentTaxon.value = null;
    if(unusedTaxaArr.value.length > 0){
        const randomIndex = Math.floor(Math.random() * unusedTaxaArr.value.length);
        currentTaxon.value = Object.assign({}, unusedTaxaArr.value[randomIndex]);
    }
}

function setDisplayValue() {
    displayPopup.value = props.showPopup && !displayInstructionsPopup.value;
}

function setHeaderSize(headerSize) {
    headerHeight.value = headerSize.height;
}

function showAnswerNotification(correct, message) {
    $q.notify({
        color: (correct ? 'green' : 'red'),
        classes: 'text-h6 text-bold',
        textColor: 'white',
        message: message,
        position: 'center',
        multiLine: true,
        timeout: 2500
    })
}

function showCurrentTaxon() {
    openTaxonProfilePopup(currentTaxon.value, true);
    incorrectTidArr.value.push(Number(currentTaxon.value['tid']));
    setCurrentTaxon();
}

onMounted(() => {
    setDisplayValue();
});
</script>
