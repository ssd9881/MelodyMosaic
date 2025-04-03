import axios from 'axios';
import { plainToInstance } from 'class-transformer';
import {refreshAccessToken} from './auth'
import Album from '../Classes/Album';
import Playlist, { NewPlaylistInfo } from '../Classes/Playlist';
import User from '../Classes/User';
import { chunkArray } from './helpers';
import Track, { TrackRecommendations } from '../Classes/Track';
import Artist from '../Classes/Artist';

const excludeVals = { excludeExtraneousValues: true }

const spApiClient = axios.create({
  baseURL: 'https://api.spotify.com/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for handling token refresh
spApiClient.interceptors.response.use(response => response, async (error) => {
    if (error.response && error.response.status === 401) {
        await refreshAccessToken()
    }
    alert("Request failed due to invalid token. Token was refreshed. Please resubmit request.")
    return Promise.reject(error);
});

function getAuthHeader() {
    return {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    };
};

async function apiGet(endpoint: string, options = {}) {
    return spApiClient.get(endpoint, { ...options, headers: getAuthHeader() });
}

async function apiPost(endpoint: string, data: any, options = {}) {
    return spApiClient.post(endpoint, data, { ...options, headers: getAuthHeader() });
}

async function apiDelete(endpoint: string, options = {}) {
    return spApiClient.delete(endpoint, { ...options, headers: getAuthHeader() });
}

async function getAllItems(endpoint: string, options = {}): Promise<any[]> {
    let items: any[] = [];
    let nextPageUrl = endpoint;
    do {
        const response = await apiGet(nextPageUrl, options);
        items = items.concat(response.data.items);
        nextPageUrl = response.data.next;
    } while (nextPageUrl);
    return items;
}

export async function getLikedAlbums(): Promise<Album[]> {
    const items = await getAllItems('me/albums?limit=50');
    return plainToInstance(Album, items.map(item => item.album), excludeVals);
};

export async function getPlaylists(): Promise<Playlist[]> {
    const items = await getAllItems('me/playlists?limit=50');
    return  plainToInstance(Playlist, items, excludeVals);
};

export async function getUserInfo(): Promise<User> {
    const response = await apiGet('me');
    return plainToInstance(User, response.data);
}

export async function getPlaylistTracks(playlistId: string): Promise<String[]> {
  const items = await getAllItems(`playlists/${playlistId}/tracks?fields=next,items(track(uri))&limit=50`);
  return items.map((res: any) => res.track.uri);
}

export async function addTracksToPlaylist(playlistId: string, trackUris: String[]) {
    // Can only add 100 tracks per request
    const trackChunks = chunkArray(trackUris, 100);
    const promises = trackChunks.map(chunk => 
        apiPost(`playlists/${playlistId}/tracks`, { uris: chunk })
    );
    const responses = await Promise.all(promises);
    return responses.map((response) => response.data);
}

export async function removeTracksFromPlaylist(playlistId: string, trackUris: String[]) {
    // Can only remove 100 tracks per request
    const trackChunks = chunkArray(trackUris, 100);
    const promises = trackChunks.map(chunk => 
        apiDelete(`playlists/${playlistId}/tracks`, { tracks: chunk })
    );
    const responses = await Promise.all(promises);
    return responses.map((response) => response.data);
}

export async function createPlaylist(newPlaylistInfo: NewPlaylistInfo, user_id: string): Promise<Playlist> {
    const response = await apiPost(`users/${user_id}/playlists`, newPlaylistInfo);
    return plainToInstance(Playlist, response.data);
}

export async function recommendTracks(seedArtists: string[] = [], seedGenres: string[] = [], seedTracks: string[] = [], limit: number = 100, extraOptions: any = {}): Promise<TrackRecommendations[]> {
    const params = new URLSearchParams({
        limit: (limit > 100 ? 100 : limit),
        ...(seedArtists.length > 0 ? { seed_artists: seedArtists.join(',') } : {}),
        ...(seedGenres.length > 0 ? { seed_genres: seedGenres.join(',') } : {}),
        ...(seedTracks.length > 0 ? { seed_tracks: seedTracks.join(',') } : {}),
        ...extraOptions,
    });
    const response = await apiGet(`recommendations?${params.toString()}`);
    return plainToInstance(TrackRecommendations, response.data.tracks, excludeVals);
}

export async function getAlbumTracks(albumId: string): Promise<Track[]> {
    const response = await getAllItems(`albums/${albumId}/tracks?limit=50`);
    return plainToInstance(Track, response, excludeVals);
}

export async function getAlbum(albumId: string): Promise<Album> {
    const response = await apiGet(`albums/${albumId}`);
    return plainToInstance(Album, response.data as Album, excludeVals);
}

export async function getArtists(artistIds: string[]): Promise<Artist[]> {
    const response = await apiGet(`artists?ids=${artistIds.join(',')}`);
    return plainToInstance(Artist, response.data.artists, excludeVals);
}

export async function getSinglePlaylist(playlistId: string): Promise<Playlist> {
    const response = await apiGet(`playlists/${playlistId}`);
    return plainToInstance(Playlist, response.data as Playlist, excludeVals);
}