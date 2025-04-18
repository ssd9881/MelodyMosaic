from datetime import datetime
import logging
from flask import Flask, jsonify, request, session,make_response
from flask_cors import CORS
from dotenv import load_dotenv
import os
from db_helpers import add_owner_to_playlist_dict, make_playlist_dict
from models import db, User, Playlist, SmartPlaylist, PlaylistFollower, Album, AlbumFollower
from flask_migrate import Migrate



load_dotenv(dotenv_path='./env')  # Load environment variables from .env file
print("DATABASE_URI:", os.getenv('DATABASE_URI'))
print("Loaded .env file: ", os.environ)
if not os.getenv('DATABASE_URI'):
    print("DATABASE_URI is not set correctly!")
APP_SECRET = os.getenv('APP_SECRET')

domains = os.getenv('ALLOWED_DOMAINS').split(',')
print(domains)
# Init app
app = Flask(__name__)
CORS(app, supports_credentials=True, origins="http://localhost:5173")
app.secret_key = APP_SECRET
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False
print("DATABASE_URI:", os.getenv('DATABASE_URI'))
app.config['SQLALCHEMY_ECHO'] = True
logging.getLogger('flask_cors').level = logging.DEBUG

db.init_app(app)


with app.app_context():
    db.create_all()
    # db.drop_all()

migrate = Migrate(app, db)
@app.before_request
def log_request_info():
    print("Method:", request.method)
    print("URL:", request.url)
    print("Headers:", request.headers)
# ROUTES
@app.route("/")
def index():
    return "MyBackend API is running!"

@app.route("/api/user", methods=["OPTIONS","POST"])
def options_user():
    response = make_response()
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Credentials'] = 'true'  # Add credentials support
    return response
def update_user():
    data = request.json
    print(data)
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

# @app.route("/user", methods=["POST"])

# def update_user():
#     data = request.json
#     print(data)
#     id = data.get("id")

#     if not id:
#         return jsonify({"error": "User ID is required"}), 400

#     # access_token = data.get("access_token")

#     user = User.query.filter_by(id=id).first()
#     name = data.get("display_name")
#     if name:
#         if not user:
#             user = User(id=id, name=name)
#             db.session.add(user)
#         elif name != user.name:
#             user.name = name

#     db.session.commit()
#     session['user_id'] = id
#     # session['access_token'] = access_token
#     return jsonify({"message": "User updated successfully"}), 200


@app.route("/user", methods=["GET"])
def get_user():
    user_id = session.get('user_id')
    print(user_id,"userid")
    if not user_id:
        return jsonify({"error": "User ID not yet in session"}), 401

    user = User.query.filter_by(id=user_id).first_or_404()
    return jsonify(user.to_dict()), 200


@app.route("/api/albums", methods=["OPTIONS","POST"])
def update_albums():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response
    print("🔥 /api/albums POST request hit")
    user_id = session.get('user_id')
    print("User ID from session:", user_id)
    if not user_id:
        return jsonify({"error": "User ID not yet in session"}), 401

    data = request.json
    print("Raw album data received from frontend:", data)
    remove_not_found_albums = data.get("remove_not_found_albums", False)
    album_ids = []
    for album in data.get("albums", []):
        print("Processing album:", album)
        id = album.get("id")
        name = album.get("name")
        artistsData = album.get("artists")
        if not artistsData:
            continue
        artists = ", ".join([artist.get("name") for artist in artistsData])
        if not id or not name or not artists:
            continue
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

    # Add the CORS headers to the response
    response = jsonify({"message": "Albums synced successfully"})
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response, 200


@app.route("/api/albums", methods=["GET"])
def get_albums():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID not yet in session"}), 401

    albums = User.query.filter_by(id=user_id).first_or_404().liked_albums
    return jsonify([Album.query.filter_by(id=album.album_id).first_or_404().to_dict()
                    for album in albums]), 200

@app.after_request
def after_request(response):
    # Adding CORS headers after every response
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'  # The frontend URL
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, OPTIONS, PUT'
    response.headers['Access-Control-Allow-Credentials'] = 'true'  # Allow credentials
    return response


@app.route("/spotify/top-tracks/<artist_id>", methods=["GET"])
def get_top_tracks(artist_id):
    access_token = request.headers.get("Authorization")
    if not access_token:
        return jsonify({"error": "Missing access token"}), 401

    url = f"https://api.spotify.com/v1/artists/{artist_id}/top-tracks"
    headers = {
        "Authorization": access_token
    }
    params = {
        "market": "US"
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return jsonify(response.json()), 200
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500
    
# @app.route("/api/albums", methods=["OPTIONS"])
# def options_albums():
#     response = make_response()
#     response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
#     response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
#     response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
#     response.headers['Access-Control-Allow-Credentials'] = 'true'
#     return response
# @app.route("/api/albums", methods=["POST"])
# def update_albums():
#     # Ensure the user is authenticated by checking session
#     user_id = session.get('user_id')
#     if not user_id:
#         return jsonify({"error": "User ID not yet in session"}), 401

#     data = request.json
#     remove_not_found_albums = data.get("remove_not_found_albums", False)
#     album_ids = []

#     for album in data.get("albums", []):
#         id = album.get("id")
#         name = album.get("name")
#         artistsData = album.get("artists")
#         if not artistsData:
#             continue  # Skip if no artists data

#         artists = ", ".join([artist.get("name") for artist in artistsData])
#         if not id or not name or not artists:
#             continue  # Skip if invalid data

#         album_ids.append(id)
#         genres = ", ".join(album.get("genres", ""))
#         images = album.get("images", [{}])
#         img_url = images[0].get("url", "") if images else ""

#         # Check if album exists in the database
#         album_in_db = Album.query.filter_by(id=id).first()
#         if not album_in_db:
#             # If album doesn't exist, add it
#             album_in_db = Album(id=id, name=name, artists=artists, genres=genres, img_url=img_url)
#             db.session.add(album_in_db)
#         elif (name != album_in_db.name or artists != album_in_db.artists or
#               genres != album_in_db.genres or img_url != album_in_db.img_url):
#             # Update album if there are changes
#             album_in_db.name = name
#             album_in_db.artists = artists
#             album_in_db.genres = genres
#             album_in_db.img_url = img_url

#         # Add album follower entry if not already present
#         album_follower = AlbumFollower.query.filter_by(user_id=user_id, album_id=id).first()
#         if not album_follower:
#             album_follower = AlbumFollower(user_id=user_id, album_id=id)
#             db.session.add(album_follower)

#     if remove_not_found_albums:
#         # Remove albums that are no longer in the provided list
#         AlbumFollower.query.filter(AlbumFollower.user_id == user_id,
#                                    AlbumFollower.album_id.notin_(album_ids)).delete()

#     # Update user's album sync timestamp
#     user = User.query.filter_by(id=user_id).first_or_404()
#     user.album_sync_date = datetime.utcnow()

#     # Commit all changes to the database
#     db.session.commit()

#     # Return success response
#     response = jsonify({"message": "Albums synced successfully"})
#     response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'  # Frontend URL
#     response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
#     response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
#     response.headers['Access-Control-Allow-Credentials'] = 'true'
#     return response, 200


# @app.route("/api/albums", methods=["GET"])
# def get_albums():
#     # Ensure the user is authenticated by checking session
#     user_id = session.get('user_id')
#     if not user_id:
#         return jsonify({"error": "User ID not yet in session"}), 401

#     # Fetch the albums for the current user
#     albums = User.query.filter_by(id=user_id).first_or_404().liked_albums
#     return jsonify([Album.query.filter_by(id=album.album_id).first_or_404().to_dict()
#                     for album in albums]), 200

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


@app.route("/playlists", methods=["GET"])
def get_playlists():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID not yet in session"}), 401

    user = db.get_or_404(User, user_id)

    playlist_dicts = make_playlist_dict(user.followed_playlists)
    return jsonify(playlist_dicts), 200


@app.route("/api/smart_playlists", methods=["POST"])
def add_smart_playlist():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, OPTIONS,PUT'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID not yet in session"}), 401

    data = request.json
    parent_playlist_id = data.get("parent_playlist_id")
    children = data.get("children")
    if not parent_playlist_id or not children:
        return jsonify({"error": "Parent playlist ID and children are required"}), 400

    playlist = Playlist.query.filter_by(id=parent_playlist_id).first()
    if playlist is None:
        return jsonify({"error": "Parent playlist not found"}), 404

    owner_id = playlist.owner_id
    if owner_id != user_id:
        return jsonify({"error": "User ID does not match playlist owner ID"}), 403

    SmartPlaylist.query.filter_by(parent_playlist_id=parent_playlist_id).delete()
    for child_playlist_id in children:
        if child_playlist_id == parent_playlist_id:
            db.session.rollback()
            return jsonify({"error": "Child playlist cannot be the same as the parent"}), 400

        child_playlist = Playlist.query.filter_by(id=child_playlist_id).first()
        if child_playlist is None:
            db.session.rollback()
            return jsonify({"error": "Child playlist not found"}), 404
        smart_playlist = SmartPlaylist.query.filter_by(parent_playlist_id=parent_playlist_id,
                                                       child_playlist_id=child_playlist_id).first()
        if not smart_playlist:
            smart_playlist = SmartPlaylist(parent_playlist_id=parent_playlist_id,
                                           child_playlist_id=child_playlist_id)
            db.session.add(smart_playlist)

    db.session.commit()

    return jsonify({"message": "Smart playlist relationship added/updated successfully"}), 200


@app.route("/smart_playlists", methods=["GET"])
def get_smart_playlists():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID not yet in session"}), 401

    owned_playlists = User.query.get_or_404(user_id).owned_playlists
    smart_playlist_data = [
        {
            "parent_playlist": add_owner_to_playlist_dict(op.to_dict()),
            "children": [
                {
                    "playlist": add_owner_to_playlist_dict(Playlist.query.filter_by(
                        id=cp.child_playlist_id).first_or_404().to_dict()),
                    "last_sync_snapshot_id": SmartPlaylist.query.filter_by(
                        parent_playlist_id=op.id,
                        child_playlist_id=cp.child_playlist_id).first().last_sync_snapshot_id
                } for cp in op.child_playlists
            ]
        } for op in owned_playlists
        if op.child_playlists]

    return jsonify(smart_playlist_data), 200


@app.route("/api/smart_playlists/<string:playlist_id>", methods=["OPTIONS","DELETE"])
def delete_smart_playlist(playlist_id):
    if request.method == "OPTIONS":
        response = make_response()
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response
    print("🔥 /api/albums POST request hit")
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID not yet in session"}), 401

    SmartPlaylist.query.filter_by(parent_playlist_id=playlist_id).delete()
    db.session.commit()
    return jsonify({"message": "Smart playlist deleted"}), 200


@app.route("/smart_playlists/sync", methods=["POST"])
def sync_smart_playlists():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID not yet in session"}), 401

    playlist_data = request.get_json()
    if not playlist_data:
        return jsonify({"error": "No playlist data provided"}), 400

    parent_playlist_id = playlist_data.get("parent_playlist_id")
    if not parent_playlist_id:
        return jsonify({"error": "Parent playlist ID not provided"}), 400
    children = playlist_data.get("children", [])
    for child_playlist in children:
        child_playlist_id = child_playlist.get("child_playlist_id")
        snapshot_id = child_playlist.get("snapshot_id")
        if not child_playlist_id or not snapshot_id:
            return jsonify({"error": "Invalid child playlist data"}), 400

        smart_playlist = SmartPlaylist.query.\
            filter_by(parent_playlist_id=parent_playlist_id,
                      child_playlist_id=child_playlist_id).first_or_404()
        smart_playlist.last_sync_snapshot_id = snapshot_id

    db.session.commit()
    return jsonify({"message": "Smart playlist snapshots updated successfully"}), 200

from flask import make_response

@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'  # The frontend URL
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, OPTIONS, PUT'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


if __name__ == '__main__':
    app.run(debug=True,port=5000)
