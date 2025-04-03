import { NavLink, useLocation } from 'react-router-dom';

const TopNavBar = () => {
    const { pathname } = useLocation();

    return (
        <nav className="navbar navbar-expand-xl navbar-dark bg-dark fixed-top">
            <div className="container-fluid">
                <a href="/dashboard" className="navbar-brand"><span className="my">Melody</span><span className="nav-title">Mosaic</span></a>
                <div className='section-title'>
                    {pathname === '/' &&
                        <h1>Login</h1>
                    }
                    {pathname === '/dashboard' &&
                        <h1>Dashboard</h1>
                    }
                    {pathname === '/dashboard/album' &&
                        <h1>Album Dashboard</h1>
                    }
                    {pathname === '/dashboard/playlist' &&
                        <h1>Playlist Dashboard</h1>
                    }
                </div>
                <div className="collapse navbar-collapse">
                    {pathname !== '/' && <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <NavLink to="/dashboard/album" className="nav-link">Album Dashboard</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/dashboard/playlist" className="nav-link">Playlist Dashboard</NavLink>
                        </li>
                    </ul>}
                </div>
            </div>
        </nav>
    );
};

export default TopNavBar;
