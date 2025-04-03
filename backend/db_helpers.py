from models import Playlist, db, User


def make_playlist_dict(playlists):
    playlist_dicts = [Playlist.query.filter_by(id=playlist.playlist_id).first_or_404().to_dict()
                      for playlist in playlists]
    for playlist_dict in playlist_dicts:
        playlist_dict["owner_name"] = db.get_or_404(User, playlist_dict['owner_id']).name
    return playlist_dicts


def add_owner_to_playlist_dict(playlist_dict):
    playlist_dict["owner_name"] = db.get_or_404(User, playlist_dict['owner_id']).name
    return playlist_dict
