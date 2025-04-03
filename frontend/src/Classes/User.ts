import { Expose, Type } from "class-transformer";

export default class User {
    @Expose()
    id: string;
    @Expose()
    display_name: string;
    @Expose()
    images: {url: string}[]
}

export class UserData {
    @Expose()
    id: string;
    @Expose()
    name: string;
    @Expose()
    @Type(() => Date)
    album_sync_date: Date;
    @Expose()
    @Type(() => Date)
    playlist_sync_date: Date;
}