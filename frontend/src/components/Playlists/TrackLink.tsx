import { TrackDisplay } from "../../Classes/Track";

const TrackLink: React.FC<{track: TrackDisplay}> = ({ track }) => {
    const trackLink = `https://open.spotify.com/track/${track.id}`
  
    return <a href={trackLink} target="_blank" rel="noopener noreferrer">{track.name}</a>;
  };

  export default TrackLink;