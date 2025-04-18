import { Expose, Type } from "class-transformer";
import Track from "./Track";

export default class FullTrack extends Track {
  @Expose()
  album!: {
    id: string;
    name: string;
    images: { url: string }[];
  };

  @Expose()
  artists!: { id: string; name: string }[];
}
