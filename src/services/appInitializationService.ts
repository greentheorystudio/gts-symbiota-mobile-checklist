import { Filesystem,  Directory, Encoding } from '@capacitor/filesystem';
import { JeepSqlite } from 'jeep-sqlite/dist/components/jeep-sqlite';

import { DatabaseServiceInterface } from '../services/databaseService';

export interface AppInitializationServiceInterface {
    getDatabaseFileExists(): Promise<boolean>;
    getRootDirectoryExists(): Promise<boolean>;
    getSubDirectoryExists(directoryName: string): Promise<boolean>;
    initializeApp(platform: string): Promise<boolean>;
    setJeepSQLiteElement(): Promise<void>;
    validateDatabaseFile(reset: boolean): Promise<boolean>;
    validateRootDirectory(): Promise<boolean>;
    validateSubDirectories(): Promise<boolean>;
}

class AppInitializationService implements AppInitializationServiceInterface {

    databaseService!: DatabaseServiceInterface;

    constructor(
        DatabaseService: DatabaseServiceInterface
    ) {
        this.databaseService = DatabaseService;
    }

    async getDatabaseFileExists(): Promise<boolean> {
        let exists = false;
        const databaseDirContents = await Filesystem.readdir({
            path: 'mobile-checklist/database',
            directory: Directory.Data
        });
        if(databaseDirContents.files.length > 0){
            const databaseFileObj = databaseDirContents.files.find(obj => obj['name'] === 'database.json' && obj['type'] === 'file');
            if(databaseFileObj){
                exists = true;
            }
        }
        return exists;
    }

    async getRootDirectoryExists(): Promise<boolean> {
        let exists = false;
        const dataDirContents = await Filesystem.readdir({
            path: '',
            directory: Directory.Data
        });
        if(dataDirContents.files.length > 0){
            const rootDirObj = dataDirContents.files.find(obj => obj['name'] === 'mobile-checklist' && obj['type'] === 'directory');
            if(rootDirObj){
                exists = true;
            }
        }
        return exists;
    }

    async getSubDirectoryExists(directoryName: string): Promise<boolean> {
        let exists = false;
        const rootDirContents = await Filesystem.readdir({
            path: 'mobile-checklist',
            directory: Directory.Data
        });
        if(rootDirContents.files.length > 0){
            const rootDirObj = rootDirContents.files.find(obj => obj['name'] === directoryName && obj['type'] === 'directory');
            if(rootDirObj){
                exists = true;
            }
        }
        return exists;
    }

    async initializeApp(platform: string): Promise<boolean> {
        let initialized = false;
        if(platform === 'web'){
            await this.setJeepSQLiteElement();
            await this.databaseService.initWebStore();
        }
        const rootValidated = await this.validateRootDirectory();
        if(rootValidated){
            const subDirectoriesValidated = await this.validateSubDirectories();
            if(subDirectoriesValidated){
                await this.databaseService.setNewestDbVersionNumber();
                const databaseValidated = await this.validateDatabaseFile();
                if(databaseValidated){
                    const databaseConnectionValidated = await this.databaseService.createDatabaseConnection();
                    if(databaseConnectionValidated){
                        initialized = true;
                    }
                }
            }
        }
        return initialized;
    }

    async setJeepSQLiteElement(): Promise<void> {
        customElements.define('jeep-sqlite', JeepSqlite);
        const jeepEl = document.createElement('jeep-sqlite');
        document.body.appendChild(jeepEl);
        customElements.whenDefined('jeep-sqlite')
        .then(() => {
            return;
        });
    }

    async validateDatabaseFile(reset = false): Promise<boolean> {
        let validated = await this.getDatabaseFileExists();
        if(!validated || reset){
            await this.databaseService.createDatabaseJsonFile();
            validated = await this.getDatabaseFileExists();
        }
        return validated;
    }

    async validateRootDirectory(): Promise<boolean> {
        let validated = await this.getRootDirectoryExists();
        if(!validated){
            await Filesystem.mkdir({
                path: 'mobile-checklist',
                directory: Directory.Data
            });
            validated = await this.getRootDirectoryExists();
        }
        return validated;
    }

    async validateSubDirectories(): Promise<boolean> {
        let validated = await this.getSubDirectoryExists('database');
        if(!validated){
            await Filesystem.mkdir({
                path: 'mobile-checklist/database',
                directory: Directory.Data
            });
            validated = await this.getSubDirectoryExists('database');
        }
        if(validated){
            validated = await this.getSubDirectoryExists('images');
            if(!validated){
                await Filesystem.mkdir({
                    path: 'mobile-checklist/images',
                    directory: Directory.Data
                });
                validated = await this.getSubDirectoryExists('images');
            }
        }
        return validated;
    }
}

export default AppInitializationService;
