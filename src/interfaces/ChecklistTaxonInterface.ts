export interface ChecklistTaxonInterface {
    clid: number;
    tid: number;
    rankid: number;
    sciname: string;
    author: string | null;
    family: string | null;
    habitat: string | null;
    notes: string | null;
    abundance: string | null;
    descriptionJson: string | null;
    keyJson: string | null;
    synonymyJson: string | null;
    vernacularJson: string | any[] | null;
}
