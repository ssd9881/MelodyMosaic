import { useEffect } from 'react';
import '../components/Albums/Album.css'
import { retreiveAlbums, syncAlbumsWithBackend } from '../utils/data_management';
import AlbumCollage from '../components/Albums/AlbumCollage';
import AlbumRandomizer from '../components/Albums/AlbumRandomizer';
import AlbumRecommender from '../components/Albums/AlbumRecommender';
import { useAlbums } from '../contexts/AlbumContext';
import { useLoading } from '../contexts/LoadingContext';

function AlbumDashboard() {
    const { albums, setAlbums } = useAlbums();
    const { isLoading, setLoading } = useLoading();

    useEffect(() => {
        const fetchData = () => {
            setLoading(true);
            retreiveAlbums().then((albumsData) => {
                setAlbums(albumsData);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            })
            .finally(() => {
                setLoading(false);
            });
        };
        fetchData();
    }, [setAlbums, setLoading, retreiveAlbums]);

    return (
        <div className='album-dashboard'>
            {isLoading ? <p>Loading Albums From Spotify... This may take a moment. The delay related to number of albums that need to be updated from Spotify.</p> :
                <div>
                    <AlbumCollage albums={albums} />
                    <div className='dashboard-content'>
                        <AlbumRandomizer albums={albums} />
                        <hr />
                        <AlbumRecommender albums={albums} />
                    </div>
                </div>}
        </div>
    );
};

export default AlbumDashboard;
