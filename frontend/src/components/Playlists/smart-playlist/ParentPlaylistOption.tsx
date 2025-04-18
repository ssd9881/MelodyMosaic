import { PlaylistDisplay } from "../../../Classes/Playlist"

const  ParentPlaylistOption: React.FC<{playlist: PlaylistDisplay}> = ({playlist}) => {
    return (
        <div>
            <img src={playlist.img_url} alt="Playlist Cover" />
            <strong>{playlist.name}</strong>
        </div>
    )
}

export default ParentPlaylistOption;
