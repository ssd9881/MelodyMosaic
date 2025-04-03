from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy.inspection import inspect
from sqlalchemy.orm import ColumnProperty
from flask import Flask

app = Flask(__name__)
db = SQLAlchemy()
migrate = Migrate(app, db)

class Base(db.Model):
    __abstract__ = True

    def to_dict(self):
        data = {}
        for c in inspect(self).mapper.column_attrs:
            if isinstance(c, ColumnProperty):
                data[c.key] = getattr(self, c.key)
        return data


class User(Base):
    id = db.Column(db.String(255), primary_key=True)
    name = db.Column(db.String(100), nullable=True)
    album_sync_date = db.Column(db.DateTime, nullable=True)
    playlist_sync_date = db.Column(db.DateTime, nullable=True)
    owned_playlists = db.relationship('Playlist', backref='user', lazy=True,
                                      cascade="all, delete")
    followed_playlists = db.relationship('PlaylistFollower', backref='user', lazy=True,
                                         cascade="all, delete")
    liked_albums = db.relationship('AlbumFollower', backref='user', lazy=True,
                                   cascade="all, delete")


class Album(Base):
    id = db.Column(db.String(255), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    # TODO: add artist_id or make new table
    artists = db.Column(db.String(100), unique=False, nullable=False)
    genres = db.Column(db.String(100), unique=False, nullable=True)
    img_url = db.Column(db.String(255), unique=False, nullable=True)


class AlbumFollower(Base):
    user_id = db.Column(db.String(255), db.ForeignKey('user.id'), primary_key=True)
    album_id = db.Column(db.String(255), db.ForeignKey('album.id'), primary_key=True)


class Playlist(Base):
    id = db.Column(db.String(255), primary_key=True)
    name = db.Column(db.String(255), unique=False, nullable=False)
    owner_id = db.Column(db.String(255), db.ForeignKey('user.id'), nullable=False)
    snapshot_id = db.Column(db.String(255), unique=False, nullable=False)
    desc = db.Column(db.String(255), unique=False, nullable=True)
    img_url = db.Column(db.String(255), unique=False, nullable=True)
    child_playlists = db.relationship('SmartPlaylist',
                                      foreign_keys="SmartPlaylist.parent_playlist_id",
                                      # back_populates='parent_playlist',
                                      backref='playlist',
                                      lazy=True,
                                      cascade='all, delete, delete-orphan')
    followers = db.relationship('PlaylistFollower', backref='playlist',
                                lazy=True, cascade='all, delete, delete-orphan')
    # parent_playlists = db.relationship('SmartPlaylist',
    #                                    foreign_keys="SmartPlaylist.child_playlist_id",
    #                                    back_populates='child_playlist', lazy=True,
    #                                    cascade='all, delete, delete-orphan')


class PlaylistFollower(Base):
    playlist_id = db.Column(db.String(255), db.ForeignKey('playlist.id'), primary_key=True)
    user_id = db.Column(db.String(255), db.ForeignKey('user.id'), primary_key=True)


class SmartPlaylist(Base):
    parent_playlist_id = db.Column(db.String(255), db.ForeignKey('playlist.id'), primary_key=True)
    child_playlist_id = db.Column(db.String(255), db.ForeignKey('playlist.id'), primary_key=True)
    last_sync_snapshot_id = db.Column(db.String(255), unique=False, nullable=True)
    # parent_playlist = db.relationship('Playlist', foreign_keys=[parent_playlist_id],
    #                                   back_populates='child_playlists')
    # child_playlist = db.relationship('Playlist', foreign_keys=[child_playlist_id],
    #                                  back_populates='parent_playlists')
