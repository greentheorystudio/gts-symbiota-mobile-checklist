import { Loading, Notify, QSpinnerHourglass } from 'quasar';
import { FileTransfer } from '@capacitor/file-transfer';
import { CopyOptions, CopyResult, Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import JSZip from 'jszip';

export async function clearDownloadDirectory() {
    const downloadDirExists = await fileFolderExists('mobile-checklist/download');
    if(downloadDirExists){
        await deleteDirectory('mobile-checklist/download');
    }
    return;
}

export async function clearImageDirectory() {
    const imageDirContents = await getFolderContents('mobile-checklist/images');
    if(imageDirContents.files.length > 0){
        for(const folder of imageDirContents.files) {
            await deleteDirectory('mobile-checklist/images/' + folder.name);
        }
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

export async function deleteChecklistImageDirectory(clid: number) {
    const directoryPath = 'mobile-checklist/images/' + clid.toString();
    const dirExists = await fileFolderExists(directoryPath);
    if(dirExists){
        await deleteDirectory(directoryPath);
    }
    return;
}

export async function deleteDirectory(path: string) {
    if(await fileFolderExists(path)){
        await Filesystem.rmdir({
            path: path,
            directory: Directory.Data,
            recursive: true
        });
    }
    return;
}

export async function deleteFile(path: string) {
    if(await fileFolderExists(path)){
        await Filesystem.deleteFile({
            path: path,
            directory: Directory.Data
        });
    }
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

export function escapeSqlSingleQuotes(inStr: string) {
    return inStr.replaceAll("'", "''");
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
                            data: content
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

export async function getFileContents(filePath: string) {
    return await Filesystem.readFile({
        path: filePath,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
    });
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

export async function getImageBase64UriStr(imagePath: string) {
    const fileContent =  await Filesystem.readFile({
        path: imagePath,
        directory: Directory.Data
    });
    return (fileContent && fileContent.data) ? ('data:image/' + (imagePath.endsWith('.png') ? 'png' : 'jpeg') + ';base64,' + fileContent.data) : '';
}

export async function moveFile(sourcePath: string, targetPath: string) {
    if(await fileFolderExists(sourcePath)){
        const options: CopyOptions = {
            from: sourcePath,
            to: targetPath,
            directory: Directory.Data,
            toDirectory: Directory.Data
        };
        const result: CopyResult = await Filesystem.copy(options);
        if(result && result.hasOwnProperty('uri') && result.uri){
            await deleteFile(sourcePath);
            return true;
        }
        else{
            return false;
        }
    }
    else{
        return false;
    }
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
        spinnerSize: 70,
        backgroundColor: 'grey',
        message: (text ? text : ''),
        messageColor: 'primary',
        customClass: 'text-h6'
    })
}

export async function writeFile(filePath: string, content: string) {
    await Filesystem.writeFile({
        path: filePath,
        data: content,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
    });
    return;
}
