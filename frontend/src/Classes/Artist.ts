import { Expose } from "class-transformer";

export default class Artist {
    @Expose()
    id: string;
    @Expose()
    name: string;
    @Expose()
    images: {url: string}[];
    @Expose()
    genres: string[];
};