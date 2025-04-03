import React, { ReactNode, createContext, useContext, useState } from "react";
import { AlbumDisplay } from "../Classes/Album";

interface AlbumContextType {
    albums: AlbumDisplay[];
    setAlbums: (albums: AlbumDisplay[]) => void;
}

const AlbumContext = createContext<AlbumContextType | undefined>(undefined);

export function useAlbums() {
    const context = useContext(AlbumContext);
    if (context === undefined) {
        throw new Error("useAlbums must be used within an AlbumsProvider");
    }
    return context;
}

interface AlbumsProviderProps {
    children: ReactNode;
}

export const AlbumProvider: React.FC<AlbumsProviderProps> = ({ children }) => {
    const [albums, setAlbums] = useState<AlbumDisplay[]>([]);

    const value = {
        albums,
        setAlbums
    }

    return <AlbumContext.Provider value={value}>{children}</AlbumContext.Provider>;
}