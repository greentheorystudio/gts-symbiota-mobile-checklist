<template>
    <q-dialog v-model="displayPopup" full-width full-height>
        <q-card>
            <q-card-section class="q-pa-none row justify-between q-gutter-sm no-wrap">
                <div class="q-py-sm q-pl-sm text-h5 text-bold">Taxon</div>
                <div>
                    <q-btn square glossy padding="5px 10px" color="negative" icon="close" @click="closePopup();"></q-btn>
                </div>
            </q-card-section>
            <q-card-section class="scroll">
                <div class="q-pa-md">

                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, toRefs, watch } from 'vue';

const props = defineProps({
    showPopup: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close:popup']);

const displayPopup = ref(false);
const propsRefs = toRefs(props);

watch(propsRefs.showPopup, () => {
    setDisplayValue();
});

function closePopup() {
    emit('close:popup');
}

function setDisplayValue() {
    displayPopup.value = props.showPopup;
}

onMounted(() => {
    setDisplayValue();
});
</script>
