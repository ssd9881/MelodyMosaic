import { PlaylistDisplay } from "../../Classes/Playlist";

const PlaylistLink: React.FC<{playlist: PlaylistDisplay}> = ({ playlist }) => {
    const playlistLink = `https://open.spotify.com/playlist/${playlist.id}`
  
    return <a href={playlistLink} target="_blank" rel="noopener noreferrer">{playlist.name}</a>;
  };

  export default PlaylistLink;