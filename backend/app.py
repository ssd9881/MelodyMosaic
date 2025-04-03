from datetime import datetime
# import logging
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from dotenv import load_dotenv
import os
from db_helpers import add_owner_to_playlist_dict, make_playlist_dict
from models import db, User, Playlist, SmartPlaylist, PlaylistFollower, Album, AlbumFollower
from flask_migrate import Migrate



load_dotenv(dotenv_path='/Users/sharvary/Documents/MyMusic-master/backend/.env')  # Load environment variables from .env file
print("DATABASE_URI:", os.getenv('mysql+pymysql://root:Shruty%4031@localhost:3306/flask'))
print("Loaded .env file: ", os.environ)
if not os.getenv('DATABASE_URI'):
    print("DATABASE_URI is not set correctly!")
APP_SECRET = os.getenv('APP_SECRET')

domains = os.getenv('ALLOWED_DOMAINS').split(',')
print(domains)
# Init app
app = Flask(__name__)
CORS(app, supports_credentials=True, origins=domains)
app.secret_key = APP_SECRET
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Shruty%4031@localhost:3306/flask'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
print("DATABASE_URI:", os.getenv('DATABASE_URI'))
# app.config['SQLALCHEMY_ECHO'] = True
# logging.getLogger('flask_cors').level = logging.DEBUG

db.init_app(app)


with app.app_context():
    db.create_all()
    # db.drop_all()

migrate = Migrate(app, db)

# ROUTES
@app.route("/")
def index():
    return "MyBackend API is running!"


@app.route("/user", methods=["POST"])
def update_user():
    data = request.json
    id = data.get("id")

    if not id:
        return jsonify({"error": "User ID is required"}), 400

    # access_token = data.get("access_token")

    user = User.query.filter_by(id=id).first()
    name = data.get("display_name")
    if name:
        if not user:
            user = User(id=id, name=name)
            db.session.add(user)
        elif name != user.name:
            user.name = name

    db.session.commit()
    session['user_id'] = id
    # session['access_token'] = access_token
    return jsonify({"message": "User updated successfully"}), 200


@app.route("/user", methods=["GET"])
def get_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID not yet in session"}), 401

    user = User.query.filter_by(id=user_id).first_or_404()
    return jsonify(user.to_dict()), 200


@app.route("/api/albums", methods=["POST"])
def update_albums():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID not yet in session"}), 401

    data = request.json
    remove_not_found_albums = data.get("remove_not_found_albums", False)
    album_ids = []
    for album in data.get("albums", []):
        id = album.get("id")
        name = album.get("name")
        artistsData = album.get("artists")
        if not artistsData:
            continue
            # return jsonify({"error": "Artists data is required"}), 400
        artists = ", ".join([artist.get("name") for artist in artistsData])
        if not id or not name or not artists:
            continue
            # return jsonify({"error": "Invalid album data"}), 400

        album_ids.append(id)

        genres = ", ".join(album.get("genres", ""))
        images = album.get("images", [{}])
        img_url = images[0].get("url", "") if images else ""

        album = Album.query.filter_by(id=id).first()
        if not album:
            album = Album(id=id, name=name, artists=artists, genres=genres, img_url=img_url)
            db.session.add(album)
        elif (name != album.name or artists != album.artists or genres != album.genres or
              img_url != album.img_url):
            album.name = name
            album.artists = artists
            album.genres = genres
            album.img_url = img_url

        album_follower = AlbumFollower.query.filter_by(user_id=user_id, album_id=id).first()
        if not album_follower:
            album_follower = AlbumFollower(user_id=user_id, album_id=id)
            db.session.add(album_follower)

    if remove_not_found_albums:
        AlbumFollower.query.filter(AlbumFollower.user_id == user_id,
                                   AlbumFollower.album_id.notin_(album_ids)).delete()

    user = User.query.filter_by(id=user_id).first_or_404()
    user.album_sync_date = datetime.utcnow()

    db.session.commit()
    return jsonify({"message": "Albums synced successfully"}), 200


@app.route("/api/albums", methods=["GET"])
def get_albums():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID not yet in session"}), 401

    albums = User.query.filter_by(id=user_id).first_or_404().liked_albums
    return jsonify([Album.query.filter_by(id=album.album_id).first_or_404().to_dict()
                    for album in albums]), 200


@app.route("/playlists", methods=["POST"])
def update_playlists():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID not yet in session"}), 401

    data = request.json
    remove_not_found_playlists = data.get("remove_not_found_playlists", False)
    provided_ids = []
    for playlist_data in data.get('playlists', []):
        playlist_id = playlist_data.get("id")
        name = playlist_data.get("name")
        owner_data = playlist_data.get("owner")
        owner_id = owner_data.get("id")
        snapshot_id = playlist_data.get("snapshot_id")
        if not playlist_id or not name or not owner_data or not owner_id or not snapshot_id:
            print(playlist_data, "skipping...")
            continue
            # return jsonify({"error": "Playlist data is incomplete"}), 400
        provided_ids.append(playlist_id)
        owner_name = owner_data.get("display_name", owner_id)
        desc = playlist_data.get("description", "")
        images = playlist_data.get("images", [{}])
        img_url = images[0].get("url", "") if images else ""

        playlist = Playlist.query.filter_by(id=playlist_id, owner_id=owner_id).first()
        if not playlist:
            owner = User.query.filter_by(id=owner_id).first()
            if not owner:
                owner = User(id=owner_id, name=owner_name)
                db.session.add(owner)
            playlist = Playlist(id=playlist_id, name=name, owner_id=owner_id,
                                snapshot_id=snapshot_id, desc=desc, img_url=img_url)
            db.session.add(playlist)
        elif snapshot_id != playlist.snapshot_id:
            playlist.name = name
            playlist.owner_id = owner_id
            playlist.snapshot_id = snapshot_id
            playlist.desc = desc
            playlist.img_url = img_url

        playlist_follower = PlaylistFollower.query.filter_by(playlist_id=playlist_id,
                                                             user_id=user_id).first()
        if not playlist_follower:
            playlist_follower = PlaylistFollower(playlist_id=playlist_id, user_id=user_id)
            db.session.add(playlist_follower)

    if remove_not_found_playlists:
        PlaylistFollower.query.filter(
            PlaylistFollower.playlist_id.notin_(provided_ids),
            PlaylistFollower.user_id == user_id).delete()

        SmartPlaylist.query.filter(
            SmartPlaylist.parent_playlist_id.notin_(provided_ids)).delete()

        SmartPlaylist.query.filter(
            SmartPlaylist.child_playlist_id.notin_(provided_ids)).delete()

        Playlist.query.filter(Playlist.owner_id == user_id,
                              Playlist.id.notin_(provided_ids)).delete()

        # for playlist in playlists_to_delete:
        #     db.session.delete(playlist)

        # for follower in following_to_delete:
        #     db.session.delete(follower)

    user = User.query.filter_by(id=user_id).first()
    user.playlist_sync_date = datetime.utcnow()

    db.session.commit()
    return jsonify({"message": "Playlists updated successfully"}), 200


if __name__ == '__main__':
    app.run(debug=True)
