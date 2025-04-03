import { AlbumDisplay } from "../Classes/Album";
import { albumToAlbumDisplay, trackRecommendationsToTrackDisplay } from "./helpers";
import { getAlbum, getAlbumTracks, getArtists, getPlaylistTracks, recommendTracks } from "./spotify_api_handler";
import { PlaylistDisplay } from "../Classes/Playlist";
import _ from "lodash"
import { TrackDisplay, TrackRecommendations } from "../Classes/Track";

export async function recommendAlbum(baseAlbum: AlbumDisplay, excludeAlbums: string[] = []): Promise<AlbumDisplay> {
    const tracks = await getAlbumTracks(baseAlbum.id).then(tracks => {
        tracks.sort((a, b) => b.popularity - a.popularity);
        return tracks;
    });

    const top5Tracks = tracks.slice(0, 5);

    // gather artist_ids and genres
    // const album = await getAlbum(baseAlbum.id);
    // const artistIds = album.artists.map(artist => artist.id);
    // const artists = await getArtists(artistIds);
    // const genres = artists.flatMap(artist => artist.genres);
    // const seedGenres = filterGenreSeeds(genres);

    // NOTE: Only 5 seeds total across all seeds allowed
    const recommendedTracks = await recommendTracks([], [], top5Tracks.flatMap(track => track.id))

    const albumTrackCount = recommendedTracks.reduce((count: any, track) => {
        const albumId = track.album.id;
        if (!excludeAlbums.includes(albumId)) {
            count[albumId] = (count[albumId] || 0) + 1;
        } 
        return count;
    }, {});
    // console.log(albumTrackCount);

    let maxCount = 0;
    let maxCountAlbumId = "";
    for (const albumId in albumTrackCount) {
        if (albumTrackCount[albumId] > maxCount) {
            maxCount = albumTrackCount[albumId];
            maxCountAlbumId = albumId;
        }
    }
    console.log(maxCount, maxCountAlbumId, baseAlbum.id)

    const recommendAlbum = await getAlbum(maxCountAlbumId);
    return albumToAlbumDisplay(recommendAlbum);
}

export async function recommendTracksFromPlaylist(basePlaylist: PlaylistDisplay): Promise<TrackDisplay[]> {
    const baseTrackIds = (await getPlaylistTracks(basePlaylist.id)).map(trackUri => trackUri.split(":")[2]);
    // Lets get 5 different 10 sized recommendations
    const baseTracksSample = []
    for (let i = 0; i < 5; i++) {
        baseTracksSample.push(_.sampleSize(baseTrackIds, 5));
    }

    const recommendations = Array.from(new Set(await Promise.all(baseTracksSample.map(async (sample) => {
        const recommendations = await recommendTracks([], [], sample, 12);
        return recommendations;
    })).then(recommendations => recommendations.flat())));

    return trackRecommendationsToTrackDisplay(recommendations);
}

export async function recommendTracksForPlaylist(playlist: PlaylistDisplay): Promise<TrackDisplay[]> {
    const playlistTrackIds = (await getPlaylistTracks(playlist.id)).map(trackUri => trackUri.split(":")[2]);

    const trackSamples = [];
    for (let i = 0; i < 4; i++) {
        trackSamples.push(_.sampleSize(playlistTrackIds, 5));
    }
    const recommendations = Array.from(new Set(await Promise.all(trackSamples.map(async (sample) => {
        const recommendations = await recommendTracks([], [], sample, 8);
        return recommendations;
    })).then(recommendations => recommendations.flat())));

    const playlistTrackSet = new Set(playlistTrackIds);
    const filteredRecommendations = recommendations.filter(track => !playlistTrackSet.has(track.id));
    let finalRecommendations = null;
    if (filteredRecommendations.length < 12) {
        finalRecommendations = filteredRecommendations;
    } else {
        finalRecommendations = _.sampleSize(filteredRecommendations, 12);
    }
    return trackRecommendationsToTrackDisplay(finalRecommendations);
}