import { AlbumDisplay } from "../../Classes/Album";

type AlbumCollageProps = {
    albums: AlbumDisplay[];
}

const AlbumCollage = (props: AlbumCollageProps) => {
    const {albums} = props
    let collage_albums: AlbumDisplay[] = [...albums];
    // console.log(collage_albums.length)

    // Ensure albums is not empty and collage_albums length is less than desired
    let i = 0;
    if (albums.length > 0) {
        while (collage_albums.length < 300 && i < 100) {
            collage_albums = collage_albums.concat(albums);
            // console.log(collage_albums.length, i);
            i++;
        }
    } else {
        console.log("The 'albums' array is empty.");
    }
    return (
        <div className="album-collage">
            {collage_albums.sort(() => Math.random() - 0.5).map((album, index) => (
                <img key={album.id + index} src={album.img_url} alt={album.name} className="album-cover" />
            ))}
        </div>
    );
};

export default AlbumCollage;