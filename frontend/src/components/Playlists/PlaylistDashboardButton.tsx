import { useNavigate } from 'react-router-dom';

function PlaylistDashboardButton() {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/dashboard/playlist');
    };

    return (
        <div>
            <h2>Playlist Management</h2>
            <button onClick={handleNavigate}>Go to Playlist Dashboard</button>
        </div>
    );
};

export default PlaylistDashboardButton;
