export interface ChecklistInterface {
    clid: number;
    name: string;
    title: string | null;
    locality: string | null;
    publication: string | null;
    abstract: string | null;
    authors: string | null;
    notes: string | null;
    defaultSettings: string | null;
    publishtimestamp: number;
}
