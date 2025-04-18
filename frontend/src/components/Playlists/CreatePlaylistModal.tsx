import React, { useState } from 'react';
import { addTracksToPlaylist, createPlaylist, getSinglePlaylist } from '../../utils/spotify_api_handler';
import { updatePlaylists } from '../../utils/backend_api_handler';
import './CreatePlaylist.css';
import { PlaylistDisplay } from '../../Classes/Playlist';
import { makeTrackUri, playlistToPlaylistDisplay } from '../../utils/helpers';
import { TrackDisplay } from '../../Classes/Track';
import User from '../../Classes/User';

interface CreatePlaylistModalProps {
    show: boolean;
    onHide: () => void;
    addPlaylist: (playlist: PlaylistDisplay) => void;
    tracksToAdd?: TrackDisplay[];
}

const CreateaPlaylistModal: React.FC<CreatePlaylistModalProps> = ({ show, onHide, addPlaylist, tracksToAdd }) => {
    const [playlistName, setPlaylistName] = useState('');
    const [playlistDescription, setPlaylistDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const playlistData = {
            name: playlistName,
            description: playlistDescription,
            public: isPublic,
        };
        let userLS = localStorage.getItem('user');
        const user: User | null = userLS ? JSON.parse(userLS) : null;
        if (user) {
            createPlaylist(playlistData, user.id).then((playlist): void => {
                if (tracksToAdd && tracksToAdd.length > 0) {
                    addTracksToPlaylist(playlist.id, tracksToAdd.map((track) => makeTrackUri(track.id))).then(() => {
                        // There is an API bug that assigns the playlist a weird undefined owner in response, calling API again on that specific playlist shows correct owner though. Re-call API to get the correct owner
                        getSinglePlaylist(playlist.id).then((playlist) => {
                            updatePlaylists([playlist], false);
                            addPlaylist(playlistToPlaylistDisplay(playlist));
                            alert("Created new playlist and added tracks if provided.");
                        });
                    });
                } else {
                    getSinglePlaylist(playlist.id).then((playlist) => {
                        updatePlaylists([playlist], false);
                        addPlaylist(playlistToPlaylistDisplay(playlist));
                        alert("Created new playlist and added tracks if provided.");
                    });
                }
            }, onHide);
        }
        // Hide the modal on successful creation
        onHide();
    };

    if (!show) {
        return null;
    }

    return (
        <div className="modal-backdrop">
            <div className="custom-modal">
                <div className="custom-modal-content">
                    <span className="custom-close" onClick={onHide}>&times;</span>
                    <form onSubmit={handleSubmit}>
                        <div className='row'>
                            <div className='col-4'>
                                <p>Playlist Name:</p>
                            </div>
                            <div className='col-8'>
                                <input
                                    type="text"
                                    value={playlistName}
                                    onChange={(e) => setPlaylistName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-4'>
                                <p>Description:</p>
                            </div>
                            <div className='col-8'>
                                <textarea
                                    value={playlistDescription}
                                    onChange={(e) => setPlaylistDescription(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-4'>
                                <p>Public:</p>
                            </div>
                            <div className='col-8'>
                                <label className='radio-label'>
                                    <input
                                        type="radio"
                                        name="isPublic"
                                        checked={isPublic === true}
                                        onChange={() => setIsPublic(true)}
                                    />
                                    Yes
                                </label>
                                <label className='radio-label'>
                                    <input
                                        type="radio"
                                        name="isPublic"
                                        checked={isPublic === false}
                                        onChange={() => setIsPublic(false)}
                                    />
                                    No
                                </label>
                            </div>
                        </div>
                        <button type="submit">Create</button>
                    </form>
                </div>
            </div >
        </div >
    );
};

export default CreateaPlaylistModal;
