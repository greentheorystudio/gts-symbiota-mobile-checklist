<template>
    <q-dialog v-model="displayPopup" full-width full-height>
        <q-card class="overflow-hidden">
            <q-resize-observer @resize="setCardSize" />
            <q-card-section class="q-pa-none row justify-between q-gutter-sm no-wrap">
                <q-resize-observer @resize="setHeaderSize" />
                <div class="q-py-sm q-pl-sm text-h5 text-bold">Help</div>
                <div>
                    <q-btn square glossy padding="5px 10px" color="negative" icon="close" @click="closePopup();"></q-btn>
                </div>
            </q-card-section>
            <q-card-section>
                <q-scroll-area :style="scrollerStyle">
                    <div class="q-pa-md">

                    </div>
                </q-scroll-area>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
<script setup>
import {computed, onMounted, ref, toRefs, watch} from 'vue';

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
