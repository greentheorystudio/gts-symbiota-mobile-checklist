export interface AppConfig {
    maxImagesPerTaxon: number | null;
    descSourceTab: string | null;
    datePublished: number;
    dataArchiveFilename: string;
}

export interface RemoteChecklistInterface {
    clid: number;
    name: string;
    title: string | null;
    locality: string | null;
    publication: string | null;
    abstract: string | null;
    authors: string | null;
    type: string | null;
    politicaldivision: string | null;
    searchterms: string | null;
    parent: string | null;
    parentclid: string | null;
    notes: string | null;
    latcentroid: number | null;
    longcentroid: number | null;
    pointradiusmeters: number | null;
    footprintwkt: string | null;
    percenteffort: number | null;
    access: string | null;
    defaultsettings: string | null;
    appconfigjson: AppConfig;
    iconurl: string | null;
    headerurl: string | null;
    uid: number | null;
    sortsequence: number | null;
    expiration: number | null;
    datelastmodified: string | null;
    initialtimestamp: number;
}
