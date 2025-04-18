import { useEffect, useRef, useState } from 'react';
import { PlaylistDisplay } from '../../../Classes/Playlist';
import parse from 'html-react-parser'
import PlaylistLink from '../PlaylistLink';

const ChildPlaylistCard: React.FC<{ playlist: PlaylistDisplay, isChecked: boolean }> = ({ playlist, isChecked }) => {   

     return (
            <div className="card">
                <div className="row">
                    <div className=" col-12 col-md-5">
                        <div className='card-img-container'>
                            <img src={playlist.img_url.length === 0? "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/2048px-No_image_available.svg.png" : playlist.img_url} className="card-img" alt={playlist.name} />
                            {isChecked && <div className="overlay-checkmark"></div>}
                        </div>
                    </div>
                    <div className=" col-12 col-md-7">
                        <div className="card-body">
                            <strong className="card-title"><PlaylistLink playlist={playlist} /></strong>
                            <p className="card-text"><small className="text-muted">By {playlist.owner_name ? parse(playlist.owner_name) : ''}</small></p>
                            {/* <p className="card-text">{parse(playlist.desc)}</p> */}
                            <p className="card-text desc-text">{parse(playlist.desc)}</p>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default ChildPlaylistCard;
