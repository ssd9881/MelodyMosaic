import AlbumDashboardButton from '../components/Albums/AlbumDashboardButton';
import PlaylistDashboardButton from '../components/Playlists/PlaylistDashboardButton';

function Dashboard() {

    return (
        <div className='dashboard'>
            <div className='row justify-content-center'>
                <div className='card col-4'>
                    <AlbumDashboardButton />
                </div>
                <div className='card col-4'>
                    <PlaylistDashboardButton />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
