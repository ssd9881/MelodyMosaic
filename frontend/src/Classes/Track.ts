import { Expose } from "class-transformer";

export default class Track {
    @Expose()
    id: string;
    @Expose()
    name: string;
    @Expose()
    popularity: number;
    
}

export class TrackRecommendations extends Track {
    @Expose()
    album: {id: string, name: string, images: {url: string}[]}
    @Expose()
    artists: {id: string, name: string}[]
}

export class TrackDisplay extends Track {
    @Expose()
    albumImage: string;
    @Expose()
    artists: string;
}

export interface TopTrack {
    id: string;
    name: string;
    popularity: number;
    album: {
      id: string;
      name: string;
      images: { url: string }[];
    };
    artists: {
      id: string;
      name: string;
    }[];
  }
  