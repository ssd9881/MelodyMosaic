import { PlaylistDisplay } from "../../../Classes/Playlist";
import PlaylistLink from "../PlaylistLink";

type SmallPlaylistCardProps = {
    playlist: PlaylistDisplay;
    className?: string; // <-- Add this line
  };
  
const SmallPlaylistCard: React.FC<SmallPlaylistCardProps> = ({ playlist, className }) => {
    return (
      <div className={`playlist-card ${className || ''}`}>
        <img src={playlist.img_url} alt={playlist.name} />
        <div className="playlist-info">
          <span className="playlist-name">{playlist.name}</span>
          <span className="playlist-author">by {playlist.owner_name}</span>
        </div>
      </div>
    );
  };

export default SmallPlaylistCard;