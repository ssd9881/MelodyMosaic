import axios, { AxiosRequestConfig } from 'axios';
import Playlist, { PlaylistDisplay } from '../Classes/Playlist';
import SmartPlaylist, { SmartPlaylistData, SmartPlaylistSyncData } from '../Classes/SmartPlaylist';
import User, { UserData } from '../Classes/User';
import Album, { AlbumDisplay } from '../Classes/Album';
import { plainToInstance } from 'class-transformer';

const backendClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

backendClient.interceptors.response.use(response => response,
    error => {
        alert(`Backend Request failed: ${error.response?.status} - ${error.message}. If this error persists please contact the MyMusic team. Logging back in may resolve your issue. Ensure cookies are enabled.`);
        return Promise.reject(error);
    }
);

async function backendGet(endpoint: string, options: AxiosRequestConfig = {}) {
    const response = await backendClient.get(endpoint, options);
    return response.data;
}

async function backendPost(endpoint: string, data: any, options: AxiosRequestConfig = {}) {
    const response = await backendClient.post(endpoint, data, options);
    return response.data;
}

async function backendDelete(endpoint: string, options: AxiosRequestConfig = {}) {
    const response = await backendClient.delete(endpoint, options);
    return response.data;
}

// Specific API calls
export async function updateUser(user: User): Promise<any> {
    return backendPost('/user', user);
}

export async function getUser(): Promise<UserData> {
    const userData = await backendGet('/user');
    return plainToInstance(UserData, userData)
}

export async function updateAlbums(albumsData: Album[], removeUnfound: boolean) {
    return backendPost('/albums', { albums: albumsData, remove_not_found_albums: removeUnfound });
}

export async function getAlbums(): Promise<AlbumDisplay[]> {
    return backendGet("/albums");
}

export async function updatePlaylists(playlistsData: Playlist[], removeUnfound: boolean): Promise<any> {
    return backendPost('/playlists', { playlists: playlistsData, remove_not_found_playlists: removeUnfound });
}

export async function getPlaylists(): Promise<PlaylistDisplay[]> {
    return backendGet('/playlists');
}

export async function addSmartPlaylist(smartPlaylistData: SmartPlaylistData): Promise<any> {
    return backendPost('/smart_playlists', smartPlaylistData);
}

export async function getSmartPlaylists(): Promise<SmartPlaylist[]> {
    return backendGet('/smart_playlists');
}

export async function syncSmartPlaylistData(smartPlaylistSyncData: SmartPlaylistSyncData): Promise<any> {
    return backendPost('/smart_playlists/sync', smartPlaylistSyncData);
}

export async function deleteSmartPlaylist(smartPlaylistId: string): Promise<any> {
    return backendDelete(`/smart_playlists/${smartPlaylistId}`);
}