import { useState } from "react";
import SmartPlaylist, { SmartPlaylistData } from "../../../Classes/SmartPlaylist";
import SmartPlaylistItem from "./SmartPlaylistItem";

const SmartPlaylistsCreated: React.FC<{smartPlaylists: SmartPlaylist[], setSmartPlaylists: (value: React.SetStateAction<SmartPlaylist[]>) => void}> = ({smartPlaylists, setSmartPlaylists}) => {
    const [isSyncing, setIsSyncing] = useState(false);

    const handleDelete = (smartPlaylistId: string) => {
        setSmartPlaylists(smartPlaylists.filter(smartPlaylist => smartPlaylist.parent_playlist.id !== smartPlaylistId));
    }

    return (
        <div id="created-sp" className="scroll-page">
            <h4>Smart Playlists Created</h4>
            {isSyncing ? <p>Please wait, we are syncing a smart playlist.</p> : smartPlaylists.map((smartPlaylist, idx) => <SmartPlaylistItem key={smartPlaylist.parent_playlist.id + 'smart_display'} smartPlaylist={smartPlaylist} setIsSyncing={setIsSyncing} handleDelete={handleDelete} />)}
        </div>
    );
};

export default SmartPlaylistsCreated;