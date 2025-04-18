import { Expose } from "class-transformer";
import { PlaylistDisplay } from "./Playlist";

export default class SmartPlaylist {
    @Expose()
    parent_playlist: PlaylistDisplay;
    @Expose()
    children: ChildPlaylist[];
}

export class ChildPlaylist {
    @Expose()
    playlist: PlaylistDisplay;
    @Expose()
    last_sync_snapshot_id: string;
}

export class SmartPlaylistData {
    @Expose()
    parent_playlist_id: string;
    @Expose()
    children: string[];
}

export class SmartPlaylistSyncData {
    @Expose()
    parent_playlist_id: string;
    @Expose()
    children: {child_playlist_id: string, snapshot_id: string}[];
}