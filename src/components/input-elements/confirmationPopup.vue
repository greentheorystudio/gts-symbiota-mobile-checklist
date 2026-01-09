<template>
    <q-dialog class="z-top" v-model="showPopup" persistent>
        <q-card class="q-dialog-plugin q-pa-lg">
            {{ popupText }}
            <q-card-actions align="right">
                <q-btn color="primary" :label="trueButtonText" @click="processTrueClick" />
                <q-btn v-if="cancelOption" color="primary" :label="falseButtonText" @click="processFalseClick" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script setup>
import { ref } from 'vue';

const emit = defineEmits(['confirmation:click']);

const callbackFunction = ref(null);
const cancelOption = ref(false);
const falseButtonText = ref('Cancel');
const popupText = ref(null);
const showPopup = ref(false);
const trueButtonText = ref('OK');

function openPopup(text, options = null) {
    if(text){
        popupText.value = text;
        if(options){
            if(options.hasOwnProperty('cancel')){
                cancelOption.value = options.cancel;
            }
            if(options.hasOwnProperty('falseText')){
                falseButtonText.value = options['falseText'];
            }
            if(options.hasOwnProperty('trueText')){
                trueButtonText.value = options['trueText'];
            }
            if(options.hasOwnProperty('callback')){
                callbackFunction.value = options['callback'];
            }
        }
        showPopup.value = true;
    }
}

function processFalseClick() {
    if(callbackFunction.value){
        callbackFunction.value(false);
    }
    else{
        emit('confirmation:click', false);
    }
    showPopup.value = false;
}

function processTrueClick() {
    if(callbackFunction.value){
        callbackFunction.value(true);
    }
    else{
        emit('confirmation:click', true);
    }
    showPopup.value = false;
}

defineExpose({
    openPopup
})
</script>
