import { useEffect } from "react";
import '../components/Playlists/Playlist.css';
import SmartPlaylists from "../components/Playlists/smart-playlist/SmartPlaylists";
import { retreivePlaylists, syncPlaylistsWithBackend } from "../utils/data_management";
import PlaylistRecommender from "../components/Playlists/PlaylistRecommender";
import PlaylistEnhancer from "../components/Playlists/PlaylistEnhancer";
import { usePlaylists } from "../contexts/PlaylistContext";
import { useLoading } from "../contexts/LoadingContext";

function PlaylistDashboard() {
    const {playlists, setPlaylists} = usePlaylists();
    const {isLoading, setLoading} = useLoading();

    useEffect(() => {
        const fetchData = () => {
            setLoading(true);
            retreivePlaylists().then((playlistData) => {
                setPlaylists(playlistData);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            })
            .finally(() => {
                setLoading(false);
            });
        };
        fetchData();
    }, []);

    return (
        <div className="playlist-dashboard">
            <div className="dashboard-content">
                {isLoading ? <p>Updating Playlists... This may take a moment. The delay related to number of playlist that need to be updated from Spotify.</p> : 
                    <div>                        
                        <PlaylistEnhancer playlists={playlists.filter(playlist => playlist.owner_id === JSON.parse(localStorage.getItem('user')!).id)} />
                        <hr/>
                        <PlaylistRecommender playlists={playlists} />
                        <hr />
                    </div>}
                <SmartPlaylists playlists={playlists} playlistLoading={isLoading} />
            </div>
        </div>
    )
}

export default PlaylistDashboard;