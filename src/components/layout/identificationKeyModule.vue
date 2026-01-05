<template>
    <div class="fit column q-col-gutter-lg no-wrap">
        <template v-for="heading in keyDataArr">
            <template v-if="activeChidArr.includes(Number(heading.chid))">
                <div class="full-width">
                    <q-card>
                        <q-card-section class="column q-gutter-sm">
                            <div class="text-h6 text-bold">
                                {{ heading.headingname }}
                            </div>
                            <template v-for="character in heading['characterArr']">
                                <template v-if="activeCidArr.includes(Number(character.cid))">
                                    <div class="full-width column q-gutter-xs">
                                        <div v-if="character.charactername !== heading.headingname" class="text-body1 text-bold">
                                            {{ character.charactername }}
                                        </div>
                                        <template v-for="state in character['stateArr']">
                                            <div class="full-width">
                                                <checkboxInputElement :label="state.characterstatename" :value="selectedCsidArr.includes(Number(state.csid)) ? '1' : '0'" @update:value="(value: any) => processCharacterStateSelectionChange(state, value)"></checkboxInputElement>
                                            </div>
                                        </template>
                                    </div>
                                </template>
                            </template>
                        </q-card-section>
                    </q-card>
                </div>
            </template>
        </template>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';

import { useChecklistStore } from 'src/stores/checklist';

import checkboxInputElement from 'src/components/input-elements/checkboxInputElement.vue';

const checklistStore = useChecklistStore();

const activeChidArr = computed(() => checklistStore.getActiveChidArr);
const activeCidArr = computed(() => checklistStore.getActiveCidArr);
const keyDataArr = computed(() => checklistStore.getChecklistKeyDataArr);
const selectedCsidArr = computed(() => checklistStore.getSelectedCsidArr);

function processCharacterStateSelectionChange(state: any, value: any) {
    checklistStore.processCharacterStateSelectionChange(state, value);
}
</script>
