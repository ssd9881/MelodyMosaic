import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import User from '../Classes/User';
import { retreiveAlbums, retreivePlaylists, syncAlbumsWithBackend, syncPlaylistsWithBackend } from '../utils/data_management';
import { useAlbums } from '../contexts/AlbumContext';
import { useLoading } from '../contexts/LoadingContext';
import { usePlaylists } from '../contexts/PlaylistContext';
import CreatePlaylist from './Playlists/CreatePlaylist';
import { PlaylistDisplay } from '../Classes/Playlist';

const getActiveLinkClass = ({ isActive }: { isActive: boolean }) => isActive ? 'active' : '';

const Sidebar: React.FC = () => {
    const { pathname } = useLocation();
    const { setAlbums } = useAlbums();
    const { setLoading } = useLoading();
    const { playlists, setPlaylists } = usePlaylists();
    let userLS = localStorage.getItem('user');
    const user: User | null = userLS ? JSON.parse(userLS) : null;
    const navigate = useNavigate();

    // Logout function using navigate
    const logoutUser = () => {
        try {
            localStorage.removeItem('user');
            navigate('/');
        } catch (error) {
            console.error("Error logging out:", error);
            alert("Logout failed, please try again.");
        }
    }

    if (pathname === '/')
        return <div className="sidebar bg-dark">
            <p className='green-title'>ALBUM DASHBOARD</p>
            <p className='general-info'>The Album Dashboard provides users the ability to interact with the albums they have liked, including a personalized collage of all the users albums. Other features include an Album Randomizer and Recommender.</p>
            <hr/>
            <p className='green-title'>PLAYLIST DASHBOARD</p>
            <p className='general-info'>The Playlist Dashboard allows users to interact with their playlists. There are recommendation based features as well as the main feature: Smart Playlists, which adds relationships between playlists, allowing parents to inherit tracks from child playlists.</p>
            <div className="footer">
                <span>Made by <a href='https://github.com/ssd9881' target="_blank" rel="noopener noreferrer">TypingTypescript</a></span>
            </div>
        </div>

    function handleAlbumUpdate() {
        setLoading(true);
        try {
            syncAlbumsWithBackend().then(() => retreiveAlbums().then(albumsData => {
                    setAlbums(albumsData);
                    setLoading(false);
                }));
        } catch (error) {
            console.error('Error updating albums:', error);
            setLoading(false);    
        }
    };

    function handlePlaylistUpdate() {
        setLoading(true);
        try {
            syncPlaylistsWithBackend().then(() => retreivePlaylists().then(playlistData => {
                setPlaylists(playlistData);
                setLoading(false);
            }));
        } catch (error) {
            console.error('Error updating playlists:', error);
            setLoading(false);
        }
    };

    function addPlaylist(playlist: PlaylistDisplay) {
        setPlaylists([...playlists, playlist]);
    }

    function handleUpdateLibrary() {
        setLoading(true)
        try {
            Promise.all([syncAlbumsWithBackend(), syncPlaylistsWithBackend()]).then(() => {
                Promise.all([retreiveAlbums(), retreivePlaylists()]).then(([albumsData, playlistData]) => {
                  setAlbums(albumsData);
                  setPlaylists(playlistData);
                  setLoading(false);
                });
              });
        } catch (error) {
            console.error('Error updating library:', error);
            setLoading(false)
        }
    }

    return (
        <div className="sidebar bg-dark">
            {/* Display user info if logged in */}
            {user && (<>
                <div className="user-info">
                    <img src={user.images.length > 0 ? (user.images[0].url.length > 0 ? user.images[0].url : "https://dev.acquia.com/sites/default/files/styles/coh_small_square/public/images/2023-07/GenericUserAvatar.png.webp?itok=NpTeGe9Y") : "https://dev.acquia.com/sites/default/files/styles/coh_small_square/public/images/2023-07/GenericUserAvatar.png.webp?itok=NpTeGe9Y"} alt="User" className="user-profile-img" />
                    <br/>
                    <p className="user-name"><a href={`https://open.spotify.com/user/${user.id}`} target="_blank" rel="noopener noreferrer">{user.display_name}</a></p>
                    <a onClick={logoutUser} className="logout-btn">Logout</a>
                </div>
                </>)}
            {pathname === '/dashboard' && <>
                <button className='p-2 mb-2' onClick={handleUpdateLibrary}>Update Library</button>
            </>}
            {pathname === "/dashboard/album" && (<>
                <button className='p-2 mb-2' onClick={handleAlbumUpdate}>Update Albums</button>
                <hr/>
                <a href="#randomizer">Album Randomizer</a>
                <a href="#recommender">Album Recommender</a>
            </>)}
            {pathname === "/dashboard/playlist" && (<>
                <button className='p-2 mb-2' onClick={handlePlaylistUpdate}>Update Playlists</button>
                <CreatePlaylist addPlaylist={addPlaylist} />
                <hr/>
                {/* <a href='#create'>Create Playlist</a> */}
                <a href='#enhancer'>Enhance Playlist</a>
                <a href='#recommender'>Recommend New Playlist</a>
                <a href='#smart'>Smart Playlists</a>
                <a href='#created-sp'>Created Smart Playlists</a>
            </>)}
            <hr/>
            <NavLink to="/dashboard" className={getActiveLinkClass}>Dashboard</NavLink>
            <div className="footer">
                <span>Made by <a href='https://github.com/ssd9881' target="_blank" rel="noopener noreferrer">Typing Typescript</a></span>
                
            </div>
        </div>
    );
};

export default Sidebar;
