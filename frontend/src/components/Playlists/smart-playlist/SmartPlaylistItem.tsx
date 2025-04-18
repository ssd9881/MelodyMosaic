import { useState } from 'react';
import SmartPlaylist from '../../../Classes/SmartPlaylist';
import { syncSmartPlaylist } from '../../../utils/smart_playlist';
import SmallPlaylistCard from './SmallPlaylistCard';
import { deleteSmartPlaylist } from '../../../utils/backend_api_handler';
import './SmartPlaylistItem.css';

type SmartPlaylistItemProps = {
    smartPlaylist: SmartPlaylist;
    setIsSyncing: (isSyncing: boolean) => void;
    handleDelete: (smartPlaylistId: string) => void;
};

const SmartPlaylistItem: React.FC<SmartPlaylistItemProps> = ({ smartPlaylist, setIsSyncing, handleDelete }) => {
    const [removeUnmatched, setRemoveUnmatched] = useState(false);

    function onSync() {
        setIsSyncing(true);
        try {
            syncSmartPlaylist(smartPlaylist, !removeUnmatched).then(() => {
                alert("Smart Playlist synced");
                setIsSyncing(false);
            });
        } catch (error) {
            setIsSyncing(false);
            console.error("Error syncing smart playlist");
        }
    }

    function onDelete() {
        const parentId = smartPlaylist.parent_playlist.id
        deleteSmartPlaylist(parentId).then(() => {
            handleDelete(parentId);
            alert("Smart Playlist deleted");
        });
    }

    return (
  <div className="smart-playlist-wrapper">
    <div className="smart-playlist-section">
      <h4>Parent:</h4>
      <SmallPlaylistCard
        key={smartPlaylist.parent_playlist.id + 'parent'}
        playlist={smartPlaylist.parent_playlist}
      />
    </div>

    <div className="smart-playlist-section">
      <h4>Children:</h4>
      <div className="row row-cols-1 row-cols-lg-2 row-cols-xxl-3">
        {smartPlaylist.children.map((childPlaylist) => (
          <div
            className="col"
            key={childPlaylist.playlist.id + 'div' + smartPlaylist.parent_playlist.id}
          >
            <SmallPlaylistCard
  key={childPlaylist.playlist.id + 'child' + smartPlaylist.parent_playlist.id}
  playlist={childPlaylist.playlist}
  className="vertical"
/>
          </div>
        ))}
      </div>
    </div>

    <div className="smart-playlist-actions">
      <button onClick={onSync}>Sync Playlist</button>
      <label>
        <input
          type="checkbox"
          checked={removeUnmatched}
          onChange={() => setRemoveUnmatched(!removeUnmatched)}
        />
        Delete Extra Parent Tracks
      </label>
      <button onClick={onDelete}>Remove Smart Playlist</button>
    </div>
  </div>
);
};

export default SmartPlaylistItem;
