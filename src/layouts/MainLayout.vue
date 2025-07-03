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
                    <q-btn flat dense round icon="settings" aria-label="Management" to="management" />
                    <q-btn flat dense round icon="info" aria-label="Help" to="help" />
                </div>
            </q-toolbar>
        </q-header>

        <q-drawer v-model="leftDrawerOpen" bordered>

        </q-drawer>

        <q-page-container>
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script lang="ts">
import { computed, defineComponent, inject, ref } from 'vue';

export default defineComponent({
    name: 'MainLayout',
    setup() {
        const checklistDisplayStore = inject('checklistDisplayStore');

        const checklistArr = computed(() => checklistDisplayStore.getChecklistArr);
        const leftDrawerOpen = ref(false);

        function toggleLeftDrawer() {
            leftDrawerOpen.value = !leftDrawerOpen.value;
        }

        return {
            checklistArr,
            leftDrawerOpen,
            toggleLeftDrawer
        };
    }
});
</script>
