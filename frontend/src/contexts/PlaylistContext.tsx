import React, { createContext, useContext, useState, ReactNode } from "react";
import { PlaylistDisplay } from "../Classes/Playlist"; // Adjust the import path as necessary

interface PlaylistContextType {
    playlists: PlaylistDisplay[];
    setPlaylists: (playlists: PlaylistDisplay[]) => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export function usePlaylists() {
    const context = useContext(PlaylistContext);
    if (context === undefined) {
        throw new Error("usePlaylists must be used within a PlaylistsProvider");
    }
    return context;
}

interface PlaylistsProviderProps {
    children: ReactNode;
}

export const PlaylistsProvider: React.FC<PlaylistsProviderProps> = ({ children }) => {
    const [playlists, setPlaylists] = useState<PlaylistDisplay[]>([]);

    const value = {
        playlists,
        setPlaylists
    };

    return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>;
};
