import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom'

import Login from './routes/Login'
import Callback from './routes/Callback'
import Dashboard from './routes/Dashboard'
import TopNavBar from './components/TopNavBar'
import Sidebar from './components/Sidebar'
import { AlbumProvider } from './contexts/AlbumContext'
import { LoadingProvider } from './contexts/LoadingContext'
import { PlaylistsProvider } from './contexts/PlaylistContext'
import AuthWrapper from './components/AuthWrapper'

function App() {
  return (
    <>
      <div>
        <LoadingProvider><PlaylistsProvider><AlbumProvider>
          <Router>
            <TopNavBar />
            <div className='d-flex'>
              <Sidebar />
              {/* <p>The spotify app that helps you get the most out of your music.</p> */}
              <div className="flex-grow-1 p-3 content">
                <AuthWrapper>
                <Routes>
                  <Route path='/' element={<Login />} />
                  <Route path='callback' element={<Callback />} />
                  <Route path='/dashboard' element={<Dashboard />} />
                </Routes>
                </AuthWrapper>
              </div>
            </div>
          </Router>
        </AlbumProvider></PlaylistsProvider></LoadingProvider>
      </div>

    </>
  )
}

export default App
