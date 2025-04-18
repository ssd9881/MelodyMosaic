import { useState } from "react";
import { CustomOptionType } from "../../Classes/CustomOption";
import { PlaylistDisplay } from "../../Classes/Playlist"
import { TrackDisplay } from "../../Classes/Track";
import CustomSelect from "../CustomSelect";
import { recommendTracksFromPlaylist,fetchFormattedTopTracks } from "../../utils/recommender";
import TrackList from "./TrackList";
import PlaylistLink from "./PlaylistLink";
import CreatePlaylistModal from "./CreatePlaylistModal";
import { usePlaylists } from "../../contexts/PlaylistContext";
import { getPlaylistTracks } from "../../utils/spotify_api_handler";

type PlaylistRecommenderProps = {
    playlists: PlaylistDisplay[];
}

function PlaylistRecommender({ }: PlaylistRecommenderProps) {
    const { playlists, setPlaylists } = usePlaylists();
    const [basePlaylist, setBasePlaylist] = useState<PlaylistDisplay | null>(null);
    const [recommendationBase, setRecommendationBase] = useState<PlaylistDisplay | null>(null);
    const [recommendations, setRecommendations] = useState<TrackDisplay[]>([]);
    const [loadingRecs, setLoadingRecs] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);

    const playlistOptions: CustomOptionType[] = playlists.map((playlist) => ({
        id: playlist.id,
        name: playlist.name,
        image: playlist.img_url,
        authors: playlist.owner_name
    }));

    const updateBasePlaylist = (id: string) => {
        const selectedPlaylist = playlists.find((playlist) => playlist.id === id)!;
        setBasePlaylist(selectedPlaylist);
    }

    // const handleRecommendation = () => {
    //     if (basePlaylist) {
    //         setRecommendationBase(basePlaylist);
    //         setLoadingRecs(true);
    //         recommendTracksFromPlaylist(basePlaylist).then((recommendations) => {
    //             setRecommendations(recommendations);
    //         })
    //         .catch((error) => alert("Error creating recomendations."))
    //         .finally(() => setLoadingRecs(false));
    //     } else {
    //         console.log("No base playlist selected.")
    //     }
    // }

    const handleRecommendation = async () => {
        if (!basePlaylist) {
          console.log("No base playlist selected.");
          return;
        }
      
        setRecommendationBase(basePlaylist);
        setLoadingRecs(true);
      
        try {
          const trackUris = await getPlaylistTracks(basePlaylist.id);
          if (trackUris.length === 0) throw new Error("Playlist has no tracks.");
      
          const firstTrackId = trackUris[0].split(":")[2];
      
          const trackDetails = await fetch(`https://api.spotify.com/v1/tracks/${firstTrackId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }).then(res => res.json());
      
          const artistId = trackDetails.artists?.[0]?.id;
          if (!artistId) throw new Error("Artist ID not found.");
      
          const topTracks = await fetchFormattedTopTracks(artistId); // This should return TrackDisplay[]
      
          // ✅ Ensure topTracks contains albumImage and artists
          const trackDisplays = topTracks.map(track => ({
            id: track.id,
            name: track.name,
            popularity: track.popularity,
            albumImage: track.album?.images?.[0]?.url || "",
            artists: track.artists?.map((a: any) => a.name).join(", ") || ""
          }));
      
          setRecommendations(trackDisplays);
        } catch (error) {
          console.error("Error during recommendation flow:", error);
          alert("Error creating recommendations.");
        } finally {
          setLoadingRecs(false);
        }
      };

    function addPlaylist(playlist: PlaylistDisplay) {
        setPlaylists([...playlists, playlist]);
    }

    return (
        <div id="recommender" className="scroll-page">
            <div className="row">
                <div className="col-lg-5">
                    <h2 className="title">Playlist Recommender</h2>
                    <button className="m-2" onClick={handleRecommendation}>Recommend Tracks</button>
                </div>
                <div className="col-lg-7">
                    <p>Select a Playlist to use for getting recommendations:</p>
                    <CustomSelect options={playlistOptions} onSelectChange={updateBasePlaylist} />
                </div>
                <div>
                {loadingRecs && <p>Loading recommendations... Large playlists will take longer.</p>}
                {recommendations.length > 0 && recommendationBase && <>
                    <p>Recommended Tracks for <PlaylistLink playlist={recommendationBase}/>:</p>
                    <TrackList tracks={recommendations}/>
                    <button onClick={openModal}>Add Tracks to New Playlist</button>
                    <CreatePlaylistModal show={modalVisible} onHide={closeModal} addPlaylist={addPlaylist} tracksToAdd={recommendations} />
                </>}
                </div>
            </div>
        </div>
    )
}

export default PlaylistRecommender;