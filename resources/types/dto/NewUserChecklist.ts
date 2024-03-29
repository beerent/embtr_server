export interface NewUserChecklistElement {
    title: string;
    description: string;
    tab: string;
    steps: string[];
    complete: boolean;
}

export interface NewUserChecklist {
    complete: NewUserChecklistElement[];
    incomplete: NewUserChecklistElement[];
}
