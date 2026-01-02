import { Loading, Notify, QSpinnerHourglass } from 'quasar';
import { FileTransfer } from '@capacitor/file-transfer';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import JSZip from 'jszip';

export async function clearDownloadDirectory() {
    const downloadDirExists = await fileFolderExists('mobile-checklist/download');
    if(downloadDirExists){
        await deleteDirectory('mobile-checklist/download');
    }
    return;
}

export async function createDirectory(path: string) {
    await Filesystem.mkdir({
        path: path,
        directory: Directory.Data
    });
    return;
}

export async function deleteDirectory(path: string) {
    await Filesystem.rmdir({
        path: path,
        directory: Directory.Data,
        recursive: true
    });
    return;
}

export async function deleteFile(path: string) {
    await Filesystem.deleteFile({
        path: path,
        directory: Directory.Data
    });
    return;
}

export async function downloadChecklistDataArchive(archiveUrl: string, filename: string) {

    const downloadPath = 'mobile-checklist/download/' + filename;
    const fileInfo = await Filesystem.getUri({
        directory: Directory.Data,
        path: downloadPath
    });
    await FileTransfer.addListener('progress', (progress) => {
        showWorking(`Downloading data ${((progress.bytes / progress.contentLength) * 100).toFixed(0)}%`);
    });
    try{
        await FileTransfer.downloadFile({
            url: archiveUrl,
            path: fileInfo.uri,
            progress: true
        });
        await FileTransfer.removeAllListeners();
        return true;
    }
    catch(error){
        await FileTransfer.removeAllListeners();
        return false;
    }
}

export async function extractZipFile(zipFilePath: string, destinationDirectory: string) {
    try {
        const zipData = await Filesystem.readFile({
            path: zipFilePath,
            directory: Directory.Data,
        });
        const zipContent = await JSZip.loadAsync(zipData.data, {base64: true});
        const promises: Promise<void>[] = [];
        zipContent.forEach((relativePath, zipFile) => {
            if(!zipFile.dir){
                const filePromise = (async () => {
                    const fullPath = `${destinationDirectory}/${relativePath}`;
                    const parentDir = fullPath.substring(0, fullPath.lastIndexOf('/'));
                    await Filesystem.mkdir({
                        path: parentDir,
                        directory: Directory.Data,
                        recursive: true,
                    }).catch(e => {});
                    await zipFile.async('base64').then((content: any) => {
                        return Filesystem.writeFile({
                            path: `${destinationDirectory}/${relativePath}`,
                            directory: Directory.Data,
                            data: content,
                            recursive: true
                        });
                    });
                })();
                promises.push(filePromise);
            }
        });
        await Promise.all(promises);
        return true;

    }
    catch(error){
        return false;
    }
}

export async function fileFolderExists(path: string):Promise<boolean> {
    try{
        await Filesystem.stat({
            path: path,
            directory: Directory.Data,
        });
        return true;
    }
    catch(error){
        return false;
    }
}

export async function getFolderContents(path: string) {
    return await Filesystem.readdir({
        path: path,
        directory: Directory.Data
    });
}

export function hideWorking() {
    Loading.hide();
}

export function showNotification(type: string, text: string, duration = 5000) {
    Notify.create({
        type: type,
        icon: '',
        message: text,
        multiLine: true,
        position: 'top',
        timeout: duration
    });
}

export function showWorking(text: string | null = null) {
    Loading.show({
        spinner: QSpinnerHourglass,
        spinnerColor: 'primary',
        spinnerSize: 140,
        backgroundColor: 'grey',
        message: (text ? text : ''),
        messageColor: 'primary',
        customClass: 'text-h4'
    })
}
