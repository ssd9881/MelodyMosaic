import { useEffect, useState } from "react";
import { getSmartPlaylists } from "../../../utils/backend_api_handler";
import { PlaylistDisplay } from "../../../Classes/Playlist";
import SmartPlaylist from "../../../Classes/SmartPlaylist";
import SmartPlaylistsCreated from "./SmartPlaylistsCreated";
import CreateSmartPlaylist from "./CreateSmartPlaylist";

type SmartPlaylistsProps = {
    playlists: PlaylistDisplay[];
    playlistLoading: boolean;
}

function SmartPlaylists(props: SmartPlaylistsProps) {
    const [smartPlaylists, setSmartPlaylists] = useState<SmartPlaylist[]>([]);
    const [loading, setLoading] = useState(false);

    const {playlists, playlistLoading} = props;

    useEffect(() => {
        const fetchData = () => {
            setLoading(true);
            getSmartPlaylists().then((smartPlaylistData) => setSmartPlaylists(smartPlaylistData))
            .catch((error) => console.error('Error fetching data:', error))
            .finally(() => setLoading(false));
        };
        fetchData();
    }, []);

    return (
        <div id="smart" className="scroll-page">
            <h2 className="title">Smart Playlists</h2>
            {loading || playlistLoading ? <p>Loading Smart Playlists...</p> : (
                <CreateSmartPlaylist playlists={playlists} setSmartPlaylists={setSmartPlaylists} />
            )}
            <hr/>
            <SmartPlaylistsCreated smartPlaylists={smartPlaylists} setSmartPlaylists={setSmartPlaylists} />
        </div>
    );
}

export default SmartPlaylists;
