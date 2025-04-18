

import { useState } from "react";
import { CustomOptionType } from "../../Classes/CustomOption";
import { PlaylistDisplay } from "../../Classes/Playlist";
import CustomSelect from "../CustomSelect";
import { recommendTracksForPlaylist} from "../../utils/recommender";
import {getAvailableCategories} from "../../utils/spotify_api_handler"
import { TrackDisplay } from "../../Classes/Track";
import TrackList from "./TrackList";
import { addTracksToPlaylist } from "../../utils/spotify_api_handler";
import PlaylistLink from "./PlaylistLink";
import { makeTrackUri } from "../../utils/helpers";
import { apiGet } from '../../utils/spotify_api_handler';

const PlaylistEnhancer: React.FC<{playlists: PlaylistDisplay[]}> = ({playlists}) => {
    const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistDisplay | null>(null);
    const [recommendedTracks, setRecommendedTracks] = useState<TrackDisplay[]>([]);
    const [loadingRecs, setLoadingRecs] = useState(false);
    const [addedTracks, setAddedTracks] = useState(false);

    const playlistOptions: CustomOptionType[] = playlists.map((playlist) => ({
        id: playlist.id,
        name: playlist.name,
        image: playlist.img_url,
        authors: playlist.owner_name
    }));

    const updateSelectedPlaylist = (id: string) => {
        setRecommendedTracks([]);
    setAddedTracks(false);
    
    // Log the selected id to see if the function is triggered
    console.log("Selected playlist id:", id);

    const selectedPlaylist = playlists.find((playlist) => playlist.id === id)!;
    setSelectedPlaylist(selectedPlaylist);

    // Log the selected playlist to check its value
    console.log("Updated selected playlist:", selectedPlaylist);
        // setRecommendedTracks([]);
        // setAddedTracks(false);
        // const selectedPlaylist = playlists.find((playlist) => playlist.id === id)!;
        // setSelectedPlaylist(selectedPlaylist);
    }

    const handleSuggestions = () => {
        console.log("Selected Playlist in handleSuggestions:", selectedPlaylist);

    if (!selectedPlaylist) {
        alert("Please select a playlist first.");
        return;
    }

    setLoadingRecs(true);

    recommendTracksForPlaylist(selectedPlaylist).then((tracks) => {
        setRecommendedTracks(tracks);
    }).catch((error) => {
        alert("Error enhancing current playlist.");
        console.error("Error enhancing playlist:", error);
        throw new Error("Error enhancing playlist: " + error.message);
    }).finally(() => {
        setLoadingRecs(false);
    });
        // if (!selectedPlaylist) {
        //     // Check if selectedPlaylist is null or undefined
        //     console.log("Selected Playlist:", selectedPlaylist);
        //     alert("Please select a playlist to enhance first.");
        //     return; // Exit the function early if no playlist is selected
        // }
    
        // setLoadingRecs(true);
    
        // recommendTracksForPlaylist(selectedPlaylist).then((tracks) => {
        //     setRecommendedTracks(tracks);
        // }).catch((error) => {
        //     alert("Error enhancing current playlist.");
        //     console.error("Error enhancing playlist:", error);
        //     throw new Error("Error enhancing playlist: " + error.message);
        // }).finally(() => {
        //     setLoadingRecs(false);
        // });
    }

    const handleAddTracks = () => {
        if (selectedPlaylist && recommendedTracks) {
            addTracksToPlaylist(selectedPlaylist.id, recommendedTracks.map((track) => makeTrackUri(track.id))).then(() => {
                alert("Tracks added to playlist!");
                setAddedTracks(true);
            });
        } else {
            alert("Please generate recommendations for a track first.");
        }
    }
    
    return (
        <div id="enhancer" className="scroll-page">
            
            <div className="row">
                <div className="col-lg-5">
                    <h2 className="title">Playlist Enhancer</h2>
                </div>
                <div className="col-lg-7">
                    <p>Select a Playlist to Enhance:</p>
                    <CustomSelect options={playlistOptions} onSelectChange={updateSelectedPlaylist} />
                </div>
            </div>
            <button className="m-2" onClick={handleSuggestions}>Get Suggestions</button>
            {loadingRecs && <p>Loading recommendations... Large playlists will take longer.</p>}
            {(recommendedTracks.length > 0 && selectedPlaylist) && <><p>Recommended Enhancements for <PlaylistLink playlist={selectedPlaylist}/>:</p><TrackList tracks={recommendedTracks}/>
            {!addedTracks && <button onClick={handleAddTracks}>Add Tracks to Playlist</button>}</>}
        </div>
    )
};

// export async function recommendedTracksForPlaylist(playlist: PlaylistDisplay) {
//     // Log the playlist to ensure it's being passed correctly
//     console.log("Playlist passed to recommendTracksForPlaylist:", playlist);

//     // Check if playlist and playlist.id are defined
//     if (!playlist || !playlist.id) {
//         console.error("Playlist is invalid, missing id:", playlist);
//         throw new Error("Invalid playlist, missing id.");
//     }

//     // Proceed with the logic to fetch recommendations
//     try {
//         const response = await apiGet(`browse/new-releases?limit=8`);
//         // Assuming you're returning some transformed data
//         return response.data; // or transform the data as needed
//     } catch (error) {
//         console.error("Error fetching recommendations:", error);
//         throw new Error("Error fetching recommendations.");
//     }
// }

// export default PlaylistEnhancer;

// import { useState } from "react";
// import { CustomOptionType } from "../../Classes/CustomOption";
// import { PlaylistDisplay } from "../../Classes/Playlist";
// import CustomSelect from "../CustomSelect";
// import { recommendTracksForPlaylist, getTracksFromNewReleases } from "../../utils/recommender";
// import { TrackDisplay } from "../../Classes/Track";
// import TrackList from "./TrackList";
// import { addTracksToPlaylist } from "../../utils/spotify_api_handler";
// import PlaylistLink from "./PlaylistLink";
// import { makeTrackUri } from "../../utils/helpers";

// const PlaylistEnhancer: React.FC<{ playlists: PlaylistDisplay[] }> = ({ playlists }) => {
//   const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistDisplay | null>(null);
//   const [recommendedTracks, setRecommendedTracks] = useState<TrackDisplay[]>([]);
//   const [loadingRecs, setLoadingRecs] = useState(false);
//   const [addedTracks, setAddedTracks] = useState(false);

//   const playlistOptions: CustomOptionType[] = playlists.map((playlist) => ({
//     id: playlist.id,
//     name: playlist.name,
//     image: playlist.img_url,
//     authors: playlist.owner_name
//   }));

//   const updateSelectedPlaylist = (id: string) => {
//     setRecommendedTracks([]);
//     setAddedTracks(false);
//     const selected = playlists.find((playlist) => playlist.id === id)!;
//     setSelectedPlaylist(selected);
//   };

//   const handleNewReleaseSuggestions = async () => {
//     setLoadingRecs(true);
//     try {
//       const newReleaseTracks = await getTracksFromNewReleases(12);
//       setRecommendedTracks(newReleaseTracks);
//     } catch (err) {
//       alert("Failed to load new releases.");
//     } finally {
//       setLoadingRecs(false);
//     }
//   };

//   const handlePlaylistSuggestions = async () => {
//     if (!selectedPlaylist) {
//       alert("Please select a playlist first.");
//       return;
//     }

//     setLoadingRecs(true);
//     try {
//       const playlistBasedTracks = await recommendTracksForPlaylist(selectedPlaylist);
//       setRecommendedTracks(playlistBasedTracks);
//     } catch (error) {
//       console.error("Error enhancing playlist:", error);
//       alert("Error enhancing current playlist.");
//     } finally {
//       setLoadingRecs(false);
//     }
//   };

//   const handleAddTracks = () => {
//     if (selectedPlaylist && recommendedTracks.length > 0) {
//       const trackUris = recommendedTracks.map((track) => makeTrackUri(track.id));
//       addTracksToPlaylist(selectedPlaylist.id, trackUris).then(() => {
//         alert("Tracks added to playlist!");
//         setAddedTracks(true);
//       });
//     } else {
//       alert("Please generate recommendations first.");
//     }
//   };

//   return (
//     <div id="enhancer" className="scroll-page">
//       <div className="row">
//         <div className="col-lg-5">
//           <h2 className="title">Playlist Enhancer</h2>
//         </div>
//         <div className="col-lg-7">
//           <p>Select a Playlist to Enhance:</p>
//           <CustomSelect options={playlistOptions} onSelectChange={updateSelectedPlaylist} />
//         </div>
//       </div>

//       <button className="m-2" onClick={handlePlaylistSuggestions}>Enhance From Playlist</button>
//       <button className="m-2" onClick={handleNewReleaseSuggestions}>Enhance From New Releases</button>

//       {loadingRecs && <p>Loading recommendations... Large playlists will take longer.</p>}

//       {recommendedTracks.length > 0 && selectedPlaylist && (
//         <>
//           <p>Recommended Enhancements for <PlaylistLink playlist={selectedPlaylist} />:</p>
//           <TrackList tracks={recommendedTracks} />
//           {!addedTracks && <button onClick={handleAddTracks}>Add Tracks to Playlist</button>}
//         </>
//       )}
//     </div>
//   );
// };

export default PlaylistEnhancer;
