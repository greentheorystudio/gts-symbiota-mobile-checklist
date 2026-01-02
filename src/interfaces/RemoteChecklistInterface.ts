export interface AppConfig {
    maxImagesPerTaxon: number;
    descSourceTab: string;
    datePublished: number;
    dataArchiveFilename: string;
}

export interface RemoteChecklistInterface {
    clid: number;
    name: string;
    title: string;
    locality: string;
    publication: string;
    abstract: string;
    authors: string;
    type: string;
    politicaldivision: string;
    searchterms: string;
    parent: string;
    parentclid: number;
    notes: string;
    latcentroid: number;
    longcentroid: number;
    pointradiusmeters: number;
    footprintwkt: string;
    percenteffort: number;
    access: string;
    defaultsettings: string;
    appconfigjson: AppConfig;
    iconurl: string;
    headerurl: string;
    uid: number;
    sortsequence: number;
    expiration: number;
    datelastmodified: string;
    initialtimestamp: number;
}
