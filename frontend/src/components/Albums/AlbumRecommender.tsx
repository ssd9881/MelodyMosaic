import { useState } from "react";
import { AlbumDisplay } from "../../Classes/Album"
import { CustomOptionType } from "../../Classes/CustomOption";
import CustomSelect from "../CustomSelect";
import AlbumCard from "./AlbumCard";
import { recommendAlbum } from "../../utils/recommender";

type AlbumRecommenderProps = {
    albums: AlbumDisplay[];
}

function AlbumRecommender(props: AlbumRecommenderProps) {
    const {albums} = props;
    const [baseAlbum, setBaseAlbum] = useState<AlbumDisplay | null>(null);
    const [recommendedAlbum, setRecommendedAlbum] = useState<AlbumDisplay | null>(null);
    const [isRecommending, setRecommending] = useState(false);

    const albumOptions: CustomOptionType[] = albums.map(album => ({
        id: album.id,
        name: album.name,
        image: album.img_url,
        authors: album.artists,
      }));

    const updateBaseAlbum = (id: string) => {
        const selectedAlbum: AlbumDisplay = albums.find(album => album.id === id)!;
        setBaseAlbum(selectedAlbum);
    }

    const handleRecommendation = () => {
        setRecommending(true);
        if (baseAlbum) {
            recommendAlbum(baseAlbum, albums.map(album => album.id)).then(album => {
                setRecommendedAlbum(album); 
            })
            .catch(err => {
                alert(`Error recommending an album: ${err}.`)
            })
            .finally(() => {
                setRecommending(false);
            });
        } else {
            alert("Please select a base album to recommend another album.")
            // console.log("No base album selected.")
            setRecommending(false);
        }
        
    }

    return (
        <div id="recommender" className="scroll-page">
            <div className="row">
                <div className="col col-lg-5">
                    <h2 className="title shaded">Album Recommender</h2>
                    <button className="m-2" onClick={handleRecommendation}>Recommend Album</button>
                </div>
                <div className="col-lg-7">
                    <p className="shaded">Select Album to use for getting recommended Album</p>
                    <CustomSelect options={albumOptions} onSelectChange={updateBaseAlbum} />
                    
                </div>
            </div>
            <div className="row justify-content-center">
                <div className="col col-lg-10 col-xl-10 col-xxl-8">
                    {isRecommending ? <p className="shaded">Recommending...</p> : <>
                    <br/>
                    {recommendedAlbum && <AlbumCard album={recommendedAlbum}/>}
                    </>}
                </div>
            </div>
        </div>
    )


}

export default AlbumRecommender;