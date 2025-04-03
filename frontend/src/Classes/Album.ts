import { Expose } from "class-transformer";

export default class Album {
    @Expose()
    id: string;
    @Expose()
    name: string;
    @Expose()
    images: {url: string}[];
    @Expose()
    type: string;
    @Expose()
    artists: { id: string; name: string; }[];
    @Expose()
    genres: string[];
};



export class AlbumDisplay {
    @Expose()
    id: string;
    @Expose()
    name: string;
    @Expose()
    img_url: string;
    @Expose()
    type: string;
    @Expose()
    artists: string; // Comma separated string of artist names
    // TODO: Remove this field, genere data not populated for albums OR get from artists at inital scrape of album
    @Expose()
    genres: string; // Comma separated string of genre names
}
