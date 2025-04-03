import React, { createContext, useContext, useState, ReactNode } from "react";

interface LoadingContextType {
    isLoading: boolean;
    setLoading: (isLoading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
}

interface LoadingProviderProps {
    children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
    const [isLoading, setLoading] = useState<boolean>(false);

    const value = {
        isLoading,
        setLoading
    };

    return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};
