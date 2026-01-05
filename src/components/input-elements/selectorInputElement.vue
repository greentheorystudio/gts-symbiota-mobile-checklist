<template>
    <q-select ref="selectorRef" v-model="selectedOption" class="selector-input-spacer" outlined dense options-dense input-debounce="500" bg-color="white" popup-content-class="z-max" behavior="menu" input-class="z-max" :options="selectorOptions" option-value="value" option-label="label" @filter="checkFilter" @update:model-value="processValueChange" :label="label" :tabindex="tabindex">
        <template v-if="clearable && value" v-slot:append>
            <q-icon role="button" v-if="clearable && value" name="cancel" class="cursor-pointer" @click="clearValue();" @keyup.enter="clearValue();" aria-label="Clear value" :tabindex="tabindex">
                <q-tooltip anchor="top middle" self="bottom middle" class="text-body2" :delay="1000" :offset="[10, 10]">
                    Clear value
                </q-tooltip>
            </q-icon>
        </template>
        <template v-if="selectedOption || value" v-slot:selected>
            <template v-if="selectedOption && selectedOption.label">
                {{ selectedOption.label.replaceAll(' ', '&nbsp;') }}
            </template>
            <template v-else>
                {{ value.toString().replaceAll(' ', '&nbsp;') }}
            </template>
        </template>
    </q-select>
</template>
<script setup>
import { onMounted, defineEmits, ref, shallowReactive, toRefs, watch } from 'vue';

const props = defineProps({
    clearable: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        default: ''
    },
    optionLabel: {
        type: String,
        default: 'label'
    },
    options: {
        type: Array,
        default: []
    },
    optionValue: {
        type: String,
        default: 'value'
    },
    tabindex: {
        type: Number,
        default: 0
    },
    value: {
        type: String,
        default: null
    }
});

const emit = defineEmits(['update:value']);

const clearing = ref(false);
const propsRefs = toRefs(props);
const selectedOption = ref(null);
const selectorOptions = shallowReactive([]);
const selectorRef = ref(null);

watch(propsRefs.value, () => {
    setSelectedOption();
});

watch(propsRefs.options, () => {
    setOptions();
    setSelectedOption();
});

function checkFilter(input, proceed, abort) {
    if(clearing.value){
        abort();
    }
    else{
        proceed();
    }
}

function clearValue() {
    clearing.value = true;
    processValueChange(null);
    setTimeout(() => {
        clearing.value = false;
    }, 500);
}

function processValueChange(selectedObj) {
    emit('update:value', (selectedObj ? selectedObj.value : null));
}

function setOptions() {
    selectorOptions.length = 0;
    if(props.options.length > 0){
        props.options.forEach(option => {
            if(typeof option === 'string' || typeof option === 'number'){
                selectorOptions.push({value: option.toString(), label: option.toString()});
            }
            else if(typeof option === 'object' && option.hasOwnProperty(props.optionValue) && option.hasOwnProperty(props.optionLabel)){
                selectorOptions.push({value: option[props.optionValue].toString(), label: option[props.optionLabel].toString()});
            }
        });
    }
}

function setSelectedOption() {
    if(props.value){
        selectedOption.value = selectorOptions.find(opt => opt['value'].toString() === props.value.toString());
    }
    else{
        selectedOption.value = null;
    }
}

onMounted(() => {
    setOptions();
    setSelectedOption();
});
</script>
