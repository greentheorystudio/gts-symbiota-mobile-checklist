<template>
    <q-select ref="autocompleteRef" v-model="sciname" use-input hide-selected fill-input outlined dense options-dense hide-dropdown-icon popup-content-class="z-max" behavior="menu" input-class="z-max" input-debounce="0" bg-color="white" @new-value="createValue" :options="autocompleteOptions" @filter="getOptions" @blur="blurAction" @update:model-value="processChange" :label="label" :tabindex="tabindex">
        <template v-if="sciname" v-slot:append>
            <q-icon role="button" v-if="clearable && sciname" name="cancel" class="cursor-pointer" @click="clearAction();" @keyup.enter="clearAction();" aria-label="Clear value" :tabindex="tabindex">
                <q-tooltip anchor="top middle" self="bottom middle" class="text-body2" :delay="1000" :offset="[10, 10]">
                    Clear value
                </q-tooltip>
            </q-icon>
        </template>
    </q-select>
</template>
<script setup>
import { defineEmits, ref } from 'vue';

import { showNotification } from 'src/hooks/core.js';

const props = defineProps({
    acceptedTaxaOnly: {
        type: Boolean,
        default: false
    },
    clearable: {
        type: Boolean,
        default: true
    },
    hideAuthor: {
        type: Boolean,
        default: true
    },
    hideProtected: {
        type: Boolean,
        default: false
    },
    kingdomId: {
        type: Number,
        default: 0
    },
    label: {
        type: String,
        default: 'Scientific Name'
    },
    limitToOptions: {
        type: Boolean,
        default: false
    },
    optionLimit: {
        type: Number,
        default: 10
    },
    options: {
        type: Array,
        default: null
    },
    rankHigh: {
        type: Number,
        default: null
    },
    rankLimit: {
        type: Number,
        default: null
    },
    rankLow: {
        type: Number,
        default: null
    },
    sciname: {
        type: String,
        default: null
    },
    tabindex: {
        type: Number,
        default: 0
    },
    taxonType: {
        type: Number,
        default: null
    }
});

const emit = defineEmits(['update:value']);

const autocompleteOptions = ref([]);
const autocompleteRef = ref(null);

function blurAction(val) {
    if(val.target.value && val.target.value !== props.sciname){
        const optionObj = autocompleteOptions.value.find(option => option['sciname'].toLowerCase() === val.target.value.trim().toLowerCase());
        if(optionObj){
            processChange(optionObj);
        }
        else if(!props.limitToOptions){
            processChange({
                label: val.target.value,
                sciname: val.target.value,
                tid: null,
                family: null,
                author: null
            });
        }
        else{
            showNotification('negative', 'That name was not found in the taxa list');
        }
    }
}

function clearAction() {
    processChange(null);
}

function createValue(val, done) {
    if(val.length > 0) {
        const optionObj = autocompleteOptions.value.find(option => option['sciname'].toLowerCase() === val.trim().toLowerCase());
        if(optionObj){
            done(optionObj, 'add');
        }
        else if(!props.limitToOptions){
            done({
                label: val,
                sciname: val,
                tid: null,
                family: null,
                author: null
            }, 'add');
        }
        else{
            showNotification('negative', 'That name was not found in the taxa list');
        }
    }
}

function getOptions(val, update) {
    update(() => {
        if(val.length > 2) {
            setOptionsFromProps(val);
        }
        else{
            autocompleteOptions.value = [];
        }
    });
}

function processChange(taxonObj) {
    emit('update:sciname', taxonObj);
}

function setOptionsFromProps(val) {
    const newOptions = [];
    props.options.forEach(option => {
        if(option['sciname'].toLowerCase().startsWith(val.toLowerCase())) {
            newOptions.push(option);
        }
    });
    autocompleteOptions.value = newOptions;
}
</script>
