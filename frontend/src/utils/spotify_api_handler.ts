import axios from 'axios';
import { plainToInstance } from 'class-transformer';
import { refreshAccessToken } from './auth';
import Album from '../Classes/Album';
import Playlist, { NewPlaylistInfo } from '../Classes/Playlist';
import User from '../Classes/User';
import { chunkArray } from './helpers';
import Track, { TrackRecommendations } from '../Classes/Track';
import Artist from '../Classes/Artist';

const excludeVals = { excludeExtraneousValues: false };

const spApiClient = axios.create({
  baseURL: 'https://api.spotify.com/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for handling token refresh
spApiClient.interceptors.response.use(response => response, async (error) => {
  if (error.response && error.response.status === 401) {
    await refreshAccessToken();
  }
  alert("Request failed due to invalid token. Token was refreshed. Please resubmit request.");
  return Promise.reject(error);
});

function getAuthHeader() {
  return {
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
  };
}

export async function apiGet(endpoint: string, options = {}) {
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
}

export async function getPlaylists(): Promise<Playlist[]> {
  const items = await getAllItems('me/playlists?limit=50');
  return plainToInstance(Playlist, items, excludeVals);
}

export async function getUserInfo(): Promise<User> {
  const response = await apiGet('me');
  return plainToInstance(User, response.data);
}

export async function getPlaylistTracks(playlistId: string): Promise<String[]> {
  const items = await getAllItems(`playlists/${playlistId}/tracks?fields=next,items(track(uri))&limit=50`);
  return items
    .map((res: any) => res.track)    // Get the track object
    .filter((track: any) => track !== null && track !== undefined)    // Filter out null/undefined tracks
    .map((track: any) => track.uri); 
}

export async function addTracksToPlaylist(playlistId: string, trackUris: String[]) {
  // Can only add 100 tracks per request
  const token = localStorage.getItem('access_token');  // Make sure the token is valid

    if (!token) {
        // Handle invalid token (maybe trigger refresh flow)
        alert("Token expired, please reauthorize.");
        return;
    }
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    try {
        const response = await axios.post(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            { uris: trackUris },  // Ensure the track URIs are correctly formatted
            { headers }
        );
        console.log('Tracks added successfully:', response.data);
    } catch (error) {
        console.error('Error adding tracks:', error);
        alert('Error occurred while adding tracks.');
    }
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

export async function recommendTracks(limit: number = 100, offset: number = 0): Promise<TrackRecommendations[]> {
  const params = new URLSearchParams({
    limit: (limit > 100 ? 100 : limit).toString(),  // Ensure limit is not greater than 100
    offset: offset.toString()  // Set offset for pagination
  });

  try {
    const response = await apiGet(`browse/new-releases?${params.toString()}`);
    console.log(response.data);
    return plainToInstance(TrackRecommendations, response.data.albums.items, excludeVals);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw new Error("Error fetching recommendations.");
  }
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

export async function getAvailableCategories(limit: number = 50): Promise<string[]> {
    const params = new URLSearchParams({
        limit: limit.toString()
    });

    try {
        const response = await apiGet(`browse/categories?${params.toString()}`);
        const categories = response.data.categories.items;

        // Return an array of category ids or names
        return categories.map((category: any) => category.id);
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw new Error("Error fetching categories.");
    }
}

export async function getMultipleAlbums(albumIds: string[]): Promise<Album[]> {
    if (albumIds.length === 0) return [];
  
    const CHUNK_SIZE = 20; // Spotify allows max 20 album IDs per request
    const albumChunks = [];
    for (let i = 0; i < albumIds.length; i += CHUNK_SIZE) {
      albumChunks.push(albumIds.slice(i, i + CHUNK_SIZE));
    }
  
    try {
      const results: Album[] = [];
      for (const chunk of albumChunks) {
        const idsParam = chunk.join(',');
        const response = await spApiClient.get(`/albums?ids=${idsParam}`, {
          headers: getAuthHeader()
        });
        const albums = plainToInstance(Album, response.data.albums, excludeVals);
        results.push(...albums);
      }
      return results;
    } catch (error) {
      console.error("Error fetching multiple albums:", error);
      throw new Error("Failed to fetch albums from Spotify.");
    }
  }

  // 🔗 Get related artists from an artist ID
export async function getRelatedArtists(artistId: string): Promise<Artist[]> {
    const response = await apiGet(`/artists/${artistId}`);
    return plainToInstance(Artist, response.data.artists, excludeVals);
  }
  
  // 🔗 Get albums for a given artist
  export async function getArtistAlbums(artistId: string): Promise<Album[]> {
    const response = await apiGet(`/artists/${artistId}/albums`);
    return plainToInstance(Album, response.data.items, excludeVals);
  }
  
  export async function getArtistTopTracks(artistId: string, country: string = "US"): Promise<Track[]> {
    try {
      const response = await apiGet(`/artists/${artistId}/top-tracks?market=${country}`);
      return plainToInstance(Track, response.data.tracks, excludeVals);
    } catch (error) {
      console.error("Error fetching top tracks for artist:", error);
      throw new Error("Failed to get artist's top tracks.");
    }
  }


// import axios from 'axios';
// import { plainToInstance } from 'class-transformer';
// import {refreshAccessToken} from './auth'
// import Album from '../Classes/Album';
// import Playlist, { NewPlaylistInfo } from '../Classes/Playlist';
// import User from '../Classes/User';
// import { chunkArray } from './helpers';
// import Track, { TrackRecommendations } from '../Classes/Track';
// import Artist from '../Classes/Artist';

// const excludeVals = { excludeExtraneousValues: true }

// const spApiClient = axios.create({
//   baseURL: 'https://api.spotify.com/v1',
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // Interceptor for handling token refresh
// spApiClient.interceptors.response.use(response => response, async (error) => {
//     if (error.response && error.response.status === 401) {
//         await refreshAccessToken()
//     }
//     alert("Request failed due to invalid token. Token was refreshed. Please resubmit request.")
//     return Promise.reject(error);
// });

// function getAuthHeader() {
//     return {
//         Authorization: `Bearer ${localStorage.getItem('access_token')}`,
//     };
// };

// export async function apiGet(endpoint: string, options = {}) {
//     return spApiClient.get(endpoint, { ...options, headers: getAuthHeader() });
// }

// async function apiPost(endpoint: string, data: any, options = {}) {
//     return spApiClient.post(endpoint, data, { ...options, headers: getAuthHeader() });
// }

// async function apiDelete(endpoint: string, options = {}) {
//     return spApiClient.delete(endpoint, { ...options, headers: getAuthHeader() });
// }

// async function getAllItems(endpoint: string, options = {}): Promise<any[]> {
//     let items: any[] = [];
//     let nextPageUrl = endpoint;
//     do {
//         const response = await apiGet(nextPageUrl, options);
//         items = items.concat(response.data.items);
//         nextPageUrl = response.data.next;
//     } while (nextPageUrl);
//     return items;
// }

// export async function getLikedAlbums(): Promise<Album[]> {
//     const items = await getAllItems('me/albums?limit=50');
//     return plainToInstance(Album, items.map(item => item.album), excludeVals);
// };

// export async function getPlaylists(): Promise<Playlist[]> {
//     const items = await getAllItems('me/playlists?limit=50');
//     return  plainToInstance(Playlist, items, excludeVals);
// };

// export async function getUserInfo(): Promise<User> {
//     const response = await apiGet('me');
//     return plainToInstance(User, response.data);
// }

// export async function getPlaylistTracks(playlistId: string): Promise<String[]> {
//   const items = await getAllItems(`playlists/${playlistId}/tracks?fields=next,items(track(uri))&limit=50`);
//   return items.map((res: any) => res.track.uri);
// }

// export async function addTracksToPlaylist(playlistId: string, trackUris: String[]) {
//     // Can only add 100 tracks per request
//     const trackChunks = chunkArray(trackUris, 100);
//     const promises = trackChunks.map(chunk => 
//         apiPost(`playlists/${playlistId}/tracks`, { uris: chunk })
//     );
//     const responses = await Promise.all(promises);
//     return responses.map((response) => response.data);
// }

// export async function removeTracksFromPlaylist(playlistId: string, trackUris: String[]) {
//     // Can only remove 100 tracks per request
//     const trackChunks = chunkArray(trackUris, 100);
//     const promises = trackChunks.map(chunk => 
//         apiDelete(`playlists/${playlistId}/tracks`, { tracks: chunk })
//     );
//     const responses = await Promise.all(promises);
//     return responses.map((response) => response.data);
// }

// export async function createPlaylist(newPlaylistInfo: NewPlaylistInfo, user_id: string): Promise<Playlist> {
//     const response = await apiPost(`users/${user_id}/playlists`, newPlaylistInfo);
//     return plainToInstance(Playlist, response.data);
// }

// // export async function recommendTracks(seedArtists: string[] = [], seedGenres: string[] = [], seedTracks: string[] = [], limit: number = 100, extraOptions: any = {}): Promise<TrackRecommendations[]> {
// //     const params = new URLSearchParams({
// //         limit: (limit > 100 ? 100 : limit),
// //         ...(seedArtists.length > 0 ? { seed_artists: seedArtists.join(',') } : {}),
// //         ...(seedGenres.length > 0 ? { seed_genres: seedGenres.join(',') } : {}),
// //         ...(seedTracks.length > 0 ? { seed_tracks: seedTracks.join(',') } : {}),
// //         ...extraOptions,
// //     });
// //     const response = await apiGet(`browse/new-releases?${params.toString()}`);
// //     return plainToInstance(TrackRecommendations, response.data.tracks, excludeVals);
// // }

// export async function recommendTracks(limit: number = 100, offset: number = 0): Promise<TrackRecommendations[]> {
//     const params = new URLSearchParams({
//         limit: (limit > 100 ? 100 : limit).toString(),  // Ensure limit is not greater than 100
//         offset: offset.toString()  // Set offset for pagination
//     });

//     try {
//         const response = await apiGet(`browse/new-releases?${params.toString()}`);
//         return plainToInstance(TrackRecommendations, response.data.tracks, excludeVals);
//     } catch (error) {
//         console.error("Error fetching recommendations:", error);
//         throw new Error("Error fetching recommendations.");
//     }
// }

// export async function getAlbumTracks(albumId: string): Promise<Track[]> {
//     const response = await getAllItems(`albums/${albumId}/tracks?limit=50`);
//     return plainToInstance(Track, response, excludeVals);
// }

// export async function getAlbum(albumId: string): Promise<Album> {
//     const response = await apiGet(`albums/${albumId}`);
//     return plainToInstance(Album, response.data as Album, excludeVals);
// }

// export async function getArtists(artistIds: string[]): Promise<Artist[]> {
//     const response = await apiGet(`artists?ids=${artistIds.join(',')}`);
//     return plainToInstance(Artist, response.data.artists, excludeVals);
// }

// export async function getSinglePlaylist(playlistId: string): Promise<Playlist> {
//     const response = await apiGet(`playlists/${playlistId}`);
//     return plainToInstance(Playlist, response.data as Playlist, excludeVals);
// }
