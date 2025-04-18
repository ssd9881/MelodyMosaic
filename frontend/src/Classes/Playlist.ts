import { Expose } from "class-transformer";

export default class Playlist {
    @Expose()
    id: string;
    @Expose()
    name: string;
    @Expose()
    description: string;
    @Expose()
    images: {url: string}[];
    @Expose()
    type: string;
    @Expose()
    owner: {display_name: string, id: string};
    @Expose()
    snapshot_id: string;
}

export class PlaylistDisplay {
    @Expose()
    id: string;
    @Expose()
    name: string;
    @Expose()
    desc: string;
    @Expose()
    img_url: string;
    @Expose()
    type: string;
    @Expose()
    owner_id: string;
    @Expose()
    owner_name: string;
    @Expose()
    snapshot_id: string;
}

export class NewPlaylistInfo {
    name: string;
    description: string;
    public: boolean;
}