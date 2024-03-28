export interface NewUserChecklistElement {
    title: string;
    description: string;
    complete: boolean;
}

export interface NewUserChecklist {
    complete: NewUserChecklistElement[];
    incomplete: NewUserChecklistElement[];
}
