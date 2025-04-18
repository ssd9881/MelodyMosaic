import { AlbumDisplay } from "../../Classes/Album";

const AlbumCard: React.FC<{album: AlbumDisplay}> = ({album}) => {
    const albumUrl = `https://open.spotify.com/album/${album.id}`;


    return (
        <div className="container-fluid card random-album">
            <div className="row">
                <div className="col-6">
                    <img className="album-card-img" src={album.img_url} alt="album cover"/>
                </div>
                <div className="col-5 card-body">
                    <h3><a href={albumUrl} target="_blank" rel="noopener noreferrer">{album.name}</a></h3>
                    <p>by {album.artists}</p>
                </div>
            </div>
        </div>
    );
};

export default AlbumCard;