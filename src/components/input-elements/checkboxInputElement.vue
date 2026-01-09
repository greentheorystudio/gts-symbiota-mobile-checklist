<template>
    <div class="row inline q-gutter-x-xs">
        <div>
            <q-checkbox v-model="checkboxValue" :label="label" @update:model-value="processValueChange" :tabindex="tabindex" dense></q-checkbox>
        </div>
    </div>
</template>
<script setup>
import { onMounted, ref, toRefs, watch } from 'vue';

const props = defineProps({
    label: {
        type: String,
        default: ''
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

const checkboxValue = ref(false);
const propsRefs = toRefs(props);

watch(propsRefs.value, () => {
    setCheckboxValue();
});

function processValueChange(val) {
    setCheckboxValue();
    emit('update:value', (val ? 1 : null));
}

function setCheckboxValue() {
    checkboxValue.value = Number(props.value) === 1;
}

onMounted(() => {
    setCheckboxValue();
});
</script>
