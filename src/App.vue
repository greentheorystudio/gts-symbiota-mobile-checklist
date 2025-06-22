<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { Capacitor } from '@capacitor/core';
import { JeepSqlite } from 'jeep-sqlite/dist/components/jeep-sqlite';
import { Filesystem,  Directory, Encoding } from '@capacitor/filesystem';
import AppInitializationService from './services/appInitializationService';
import DatabaseService from './services/databaseService';

const databaseService = new DatabaseService();
const appInitializationService = new AppInitializationService(databaseService);

export default defineComponent({
    name: 'App',
    setup() {
        const appInitialized = ref(false);
        const appPlatform = Capacitor.getPlatform();

        /*const fileContent = ref('');
        const fileName = 'my-test-file.txt';
        const fileText = 'Hello from Capacitor Filesystem!';

        const writeFile = async () => {
            try {
                await Filesystem.writeFile({
                    path: 'secrets/text.txt',
                    data: 'This is a secret message',
                    directory: Directory.Documents,
                    encoding: Encoding.UTF8,
                });
                console.log('File written successfully!');
                Filesystem.stat({path: 'secrets/text.txt', directory: Directory.Documents})
                    .then((info) => console.log('Stat Info: ',  info))
                    .catch((e) => console.log('Error occurred while doing stat: ', e));
                readDirectory();
            } catch (error) {
                console.error('Unable to write file', error);
            }
        };
        const readFile = async () => {
            try {
                const contents = await Filesystem.readFile({
                    path: fileName,
                    encoding: Encoding.UTF8,
                });
                //fileContent.value = contents.data;
                console.log('File read successfully:', contents.data);
            } catch (e) {
                console.error('Unable to read file', e);
            }
        };
        const readDirectory = async () => {
            try {
                const contents = await Filesystem.readdir({
                    path: '',
                    directory: Directory.Documents
                });
                //fileContent.value = contents.data;
                console.log('Directory read successfully:', contents);
            } catch (e) {
                console.error('Unable to read file', e);
            }
        };
        writeFile();*/

        onMounted(async () => {
            console.log('here');
            appInitialized.value = await appInitializationService.initializeApp(appPlatform);

            if(appPlatform === 'web'){
                customElements.define('jeep-sqlite', JeepSqlite);
                const jeepEl = document.createElement('jeep-sqlite');
                document.body.appendChild(jeepEl);
                customElements.whenDefined('jeep-sqlite')
                .then(() => {
                    console.log('return');
                    appInitialized.value = await appInitializationService.initializeApp(appPlatform);
                });
            }
        });

        return {

        };
    },
    provide: {
        databaseService
    }
});
</script>
