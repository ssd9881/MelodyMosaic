import { PlaylistDisplay } from '../../../Classes/Playlist';
import ParentPlaylistOption from './ParentPlaylistOption';

interface ParentPlaylistDropdownProps {
    playlists: PlaylistDisplay[];
    selectedParentId: string;
    onParentChange: (selectedId: string) => void;
}

const ParentPlaylistDropdown: React.FC<ParentPlaylistDropdownProps> = ({ playlists, selectedParentId, onParentChange }) => {
    return (
        <label>
            <strong>Parent Playlist: </strong>
            <select value={selectedParentId} onChange={(e) => onParentChange(e.target.value)}>
                <option value="">Select Parent Playlist</option>
                {playlists.map(playlist => (
                    <option key={playlist.id} value={playlist.id}>
                        <ParentPlaylistOption playlist={playlist} />
                    </option>
                ))}
            </select>
        </label>
    );
};

export default ParentPlaylistDropdown;
