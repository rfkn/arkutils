export interface AppFile {
    name: string;
    path: string;
}

export interface AppFileBuffer extends AppFile {
    buffer: Buffer;
}
