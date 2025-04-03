import Album, { AlbumDisplay } from "../Classes/Album";
import Playlist, { PlaylistDisplay } from "../Classes/Playlist";
import { TrackDisplay, TrackRecommendations } from "../Classes/Track";
import { AVAILABLE_GENRE_SEEDS } from "./genre_seeds";

export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    let index = 0;

    while (index < array.length) {
        chunks.push(array.slice(index, index + chunkSize));
        index += chunkSize;
    }

    return chunks;
}

export function playlistToPlaylistDisplay(playlist: Playlist): PlaylistDisplay {
    return {
        id: playlist.id,
        name: playlist.name,
        desc: playlist.description,
        img_url: playlist.images && playlist.images.length > 0 ? playlist.images[0].url : "",
        type: playlist.type,
        owner_id: playlist.owner.id,
        owner_name: playlist.owner.display_name,
        snapshot_id: playlist.snapshot_id
    }
}

export function albumToAlbumDisplay(album: Album): AlbumDisplay {
    return {
        id: album.id,
        name: album.name,
        img_url: album.images && album.images.length > 0 ? album.images[0].url : "",
        type: album.type,
        artists: album.artists.map(artist => artist.name).join(", "),
        genres: album.genres.join(", "),
    }
}

export function filterGenreSeeds(genres: string[]): string[] {
    const seedGenres = [];
    for (const genre of genres) {
        if (AVAILABLE_GENRE_SEEDS.has(genre)) {
            seedGenres.push(genre);
        } else {
            const dashGenre = genre.replace("/\s/g", "-");
            if (AVAILABLE_GENRE_SEEDS.has(dashGenre)) {
                seedGenres.push(dashGenre);
            }
        }
    }
    return seedGenres;
}

export function trackRecommendationsToTrackDisplay(tracks: TrackRecommendations[]): TrackDisplay[] {
    return tracks.map(track => ({
        id: track.id,
        name: track.name,
        popularity: track.popularity,
        artists: track.artists.map(artist => artist.name).join(", "),
        albumImage: track.album.images && track.album.images.length > 0 ? track.album.images[0].url : "",
    }));
}

export function makeTrackUri(trackId: string): string {
    return `spotify:track:${trackId}`;
}