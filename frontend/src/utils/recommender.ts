import { AlbumDisplay } from "../Classes/Album";
import { albumToAlbumDisplay, trackRecommendationsToTrackDisplay,albumsToTrackDisplay } from "./helpers";
import { getAlbum, getAlbumTracks, getArtists, getPlaylistTracks, recommendTracks,getMultipleAlbums,getArtistAlbums,getArtistTopTracks } from "./spotify_api_handler";
import { PlaylistDisplay } from "../Classes/Playlist";
import _ from "lodash"
import { TrackDisplay, TrackRecommendations ,TopTrack} from "../Classes/Track";
import { apiGet } from "./spotify_api_handler";
import FullTrack from "../Classes/FullTrack"; 
import { plainToInstance } from 'class-transformer';

// export async function recommendAlbum(baseAlbum: AlbumDisplay, excludeAlbums: string[] = []): Promise<AlbumDisplay> {
//     console.log("📌 Base album:", baseAlbum);
//     console.log("📌 Exclude album IDs:", excludeAlbums);

//     const tracks = await getAlbumTracks(baseAlbum.id).then(tracks => {
//         tracks.sort((a, b) => b.popularity - a.popularity);
//         return tracks;
//     });
    
//     if (!tracks || tracks.length === 0) {
//         throw new Error("Base album has no tracks.");
//     }
//         const top5Tracks = tracks.slice(0, 5);
    
//     // gather artist_ids and genres
//     const album = await getAlbum(baseAlbum.id);
//     const artistIds = album.artists.map(artist => artist.id);
//     const artists = await getArtists(artistIds);
//     const genres = artists.flatMap(artist => artist.genres);
//     // const seedGenres = filterGenreSeeds(genres);
//     const accessToken = localStorage.getItem("spotify_access_token") || "";
//     // NOTE: Only 5 seeds total across all seeds allowed
//     // const recommendedTracks = await recommendTracks(10,10)
//     const [recommendAlbum] = await getMultipleAlbums([maxCountAlbumId]);

//     const albumTrackCount = recommendedTracks.reduce((count: any, track) => {
//         const albumId = track.album.id;
//         if (!excludeAlbums.includes(albumId)) {
//             count[albumId] = (count[albumId] || 0) + 1;
//         } 
//         return count;
//     }, {});
//     // console.log(albumTrackCount);

//     let maxCount = 0;
//     let maxCountAlbumId = "";
//     for (const albumId in albumTrackCount) {
//         if (albumTrackCount[albumId] > maxCount) {
//             maxCount = albumTrackCount[albumId];
//             maxCountAlbumId = albumId;
//         }
//     }
//     console.log("🏆 Selected album for recommendation:", maxCountAlbumId);
//     if (!maxCountAlbumId) {
//         console.warn("⚠ No album found from recommended tracks. Returning fallback.");
//         throw new Error("No valid album could be recommended.");
//     }
//     // console.log(maxCount, maxCountAlbumId, baseAlbum.id)

//     const recommendAlbum = await getAlbum(maxCountAlbumId);
//     console.log("✅ Final recommended album:", recommendAlbum);
//     return albumToAlbumDisplay(recommendAlbum);
// }
export async function recommendAlbum(baseAlbum: AlbumDisplay, excludeAlbums: string[] = []): Promise<AlbumDisplay> {
    console.log("📌 Base album:", baseAlbum);
  
    // Get album details
    const album = await getAlbum(baseAlbum.id);
    const artistId = album.artists[0]?.id;
  
    if (!artistId) {
      throw new Error("Artist ID not found in base album.");
    }
  
    // Get all albums from the artist
    const artistAlbums = await getArtistAlbums(artistId);
    const candidateAlbums = artistAlbums.filter(a => !excludeAlbums.includes(a.id));
  
    if (candidateAlbums.length === 0) {
      throw new Error("No other albums by artist available for recommendation.");
    }
  
    // Score albums by popularity of tracks
    const albumScores: Record<string, number> = {};
  
    for (const album of candidateAlbums) {
      const tracks = await getAlbumTracks(album.id);
      const score = tracks.reduce((acc, t) => acc + (t.popularity || 0), 0);
      albumScores[album.id] = score;
    }
  
    // Select highest scoring album
    const [bestAlbumId] = Object.entries(albumScores).sort((a, b) => b[1] - a[1])[0] || [];
  
    if (!bestAlbumId) {
      throw new Error("No valid album could be recommended.");
    }
  
    const recommended = await getAlbum(bestAlbumId);
    console.log("✅ Recommended album:", recommended);
    return albumToAlbumDisplay(recommended);
  }

export async function recommendTracksFromPlaylist(basePlaylist: PlaylistDisplay): Promise<TrackDisplay[]> {
    const baseTrackIds = (await getPlaylistTracks(basePlaylist.id)).map(trackUri => trackUri.split(":")[2]);
    // Lets get 5 different 10 sized recommendations
    const baseTracksSample = []
    for (let i = 0; i < 5; i++) {
        baseTracksSample.push(_.sampleSize(baseTrackIds, 5));
    }

    const recommendations = Array.from(new Set(await Promise.all(baseTracksSample.map(async (sample) => {
        const recommendations = await recommendTracks(10,10);
        return recommendations;
    })).then(recommendations => recommendations.flat())));

    return trackRecommendationsToTrackDisplay(recommendations);
}

export async function recommendTracksForPlaylist(playlist: PlaylistDisplay): Promise<TrackDisplay[]> {
    console.log("Playlist passed to recommendTracksForPlaylist:", playlist);

    // Ensure the playlist object and its id are valid
    if (!playlist || !playlist.id) {
        console.error("Playlist is invalid, missing id:", playlist);
        throw new Error("Invalid playlist, missing id.");
    }

    // const playlistTrackIds = (await getPlaylistTracks(playlist.id)).map(trackUri => trackUri.split(":")[2]);

    const playlistTrackIds = (await getPlaylistTracks(playlist.id)).map(trackUri => trackUri.split(":")[2]);
    console.log("Fetched track IDs:", playlistTrackIds);
    const trackSamples = [];
    
    for (let i = 0; i < 4; i++) {
        trackSamples.push(_.sampleSize(playlistTrackIds, 5));
    }
    const recommendations = Array.from(new Set(await Promise.all(trackSamples.map(async (sample) => {
        const recommendations = await recommendTracks(10,10);
        return recommendations;
    })).then(recommendations => recommendations.flat())));
    console.log(recommendations);
    const playlistTrackSet = new Set(playlistTrackIds);
    const filteredRecommendations = recommendations.filter(track => !playlistTrackSet.has(track.id));
    console.log("filteredRecommendations",filteredRecommendations);
    let finalRecommendations = null;
    if (filteredRecommendations.length < 12) {
        finalRecommendations = filteredRecommendations;
    } else {
        finalRecommendations = _.sampleSize(filteredRecommendations, 12);
    }
    return trackRecommendationsToTrackDisplay(finalRecommendations);
}
// export async function recommendTracksForPlaylist(playlist: PlaylistDisplay): Promise<TrackDisplay[]> {
//     console.log("Playlist passed to recommendTracksForPlaylist:", playlist);

//     // Ensure the playlist object and its id are valid
//     if (!playlist || !playlist.id) {
//         console.error("Playlist is invalid, missing id:", playlist);
//         throw new Error("Invalid playlist, missing id.");
//     }

//     const playlistTrackIds = (await getPlaylistTracks(playlist.id)).map(trackUri => trackUri.split(":")[2]);
//     console.log("Fetched track IDs:", playlistTrackIds);
//     const trackSamples = [];
    
//     for (let i = 0; i < 4; i++) {
//         trackSamples.push(_.sampleSize(playlistTrackIds, 5));
//     }
    
//     // Assuming recommendTracks now returns album data instead of track recommendations
//     const albumsData = await Promise.all(trackSamples.map(async (sample) => {
//         // Update this to fetch album data instead if needed
//         const albumsResponse = await recommendTracks(10, 10);
//         return albumsResponse;
//     })).then(responses => responses.flat());
    
//     // Convert the flattened albums data to a Set to remove duplicates
//     const uniqueAlbumsData = { items: Array.from(new Set(albumsData.map(album => album.id)))
//         .map(id => albumsData.find(album => album.id === id)) };
    
//     // Convert albums to track display format
//     const allTracks = albumsToTrackDisplay(uniqueAlbumsData);
    
//     // Continue filtering as before
//     const playlistTrackSet = new Set(playlistTrackIds);
//     const filteredTracks = allTracks.filter(track => !playlistTrackSet.has(track.id));
    
//     let finalTracks = null;
//     if (filteredTracks.length < 12) {
//         finalTracks = filteredTracks;
//     } else {
//         finalTracks = _.sampleSize(filteredTracks, 12);
//     }
    
//     return finalTracks;
// }
export async function recommendPlaylistsFromCategory(categoryId: string, limit: number = 10, offset: number = 0): Promise<PlaylistDisplay[]> {
    const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
    });

    try {
        // Fetch playlists based on the selected category
        const response = await apiGet(`browse/categories/${categoryId}/playlists?${params.toString()}`);
        const playlists = response.data.playlists.items;

        // Map the response to PlaylistDisplay format
        return playlists.map((playlist: any) => ({
            id: playlist.id,
            name: playlist.name,
            desc: playlist.description || '',
            img_url: playlist.images && playlist.images.length > 0 ? playlist.images[0].url : '',
            owner_id: playlist.owner.id,
            owner_name: playlist.owner.display_name,
            snapshot_id: playlist.snapshot_id
        }));
    } catch (error) {
        console.error("Error fetching playlists from category:", error);
        throw new Error("Error fetching playlists from category.");
    }
}
const excludeVals = { excludeExtraneousValues: true };
export async function fetchFormattedTopTracks(artistId: string, country = "US"): Promise<FullTrack[]> {
    const response = await apiGet(`/artists/${artistId}/top-tracks?market=${country}`);
    return plainToInstance(FullTrack, response.data.tracks, excludeVals);
  }
  
  export async function getTracksFromNewReleases(limit = 10): Promise<TrackDisplay[]> {
    try {
      const albums = await recommendTracks(limit);
      const tracks: TrackDisplay[] = [];
     
      for (const album of albums) {
        // Pick album image and artists
        const albumImage = album.album?.images?.[0]?.url || "default.jpg";
        const artists = album.artists?.map(a => a.name).join(", ") || "Unknown Artist";
  
        // Get tracks from the album
        const albumTracks = await getAlbumTracks(album.album.id);
  
        for (const track of albumTracks.slice(0, 1)) { // take 1 or 2 top tracks per album
          tracks.push({
            id: track.id,
            name: track.name,
            popularity: track.popularity,
            artists,
            albumImage,
          });
        }
      }
  
      return tracks.slice(0, limit); // return top N
    } catch (err) {
      console.error("🔥 Failed to fetch tracks from new releases:", err);
      return [];
    }
  }
  