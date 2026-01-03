export interface ChecklistTaxonInterface {
    clid: number;
    tid: number;
    rankid: number;
    sciname: string;
    author: string;
    family: string;
    acceptedRankid: number;
    acceptedSciname: string;
    acceptedAuthor: string;
    acceptedFamily: string;
    descriptionJson: string;
    keyJson: string;
    synonymyJson: string;
    vernacularJson: string;
}
