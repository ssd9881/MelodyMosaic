import React, { useState } from 'react';
import CreatePlaylistModal from './CreatePlaylistModal';
import { PlaylistDisplay } from '../../Classes/Playlist';

type CreatePlaylistProps = {
    addPlaylist: (playlist: PlaylistDisplay) => void;
}

const CreatePlaylist: React.FC<CreatePlaylistProps> = (props) => {
    const {addPlaylist} = props
    const [modalVisible, setModalVisible] = useState(false);

    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);

    return (
        <div id="create">
            <button className='p-2 mb-2' onClick={openModal}>Create New Playlist</button>
            <CreatePlaylistModal show={modalVisible} onHide={closeModal} addPlaylist={addPlaylist} />
        </div>
    );
};

export default CreatePlaylist;
