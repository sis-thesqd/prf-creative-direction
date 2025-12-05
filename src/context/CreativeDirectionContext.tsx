/**
 * Creative Direction Context
 *
 * React context for sharing API configuration across components.
 */

"use client";

import React, { createContext, useContext } from 'react';
import type { CreativeDirectionApiConfig, CreativeDirectionContextValue } from '../types/creativeDirection';

const CreativeDirectionContext = createContext<CreativeDirectionContextValue | null>(null);

export interface CreativeDirectionProviderProps {
    children: React.ReactNode;
    apiConfig: CreativeDirectionApiConfig;
}

export function CreativeDirectionProvider({ children, apiConfig }: CreativeDirectionProviderProps) {
    const value: CreativeDirectionContextValue = {
        apiConfig,
    };

    return (
        <CreativeDirectionContext.Provider value={value}>
            {children}
        </CreativeDirectionContext.Provider>
    );
}

export function useCreativeDirectionContext(): CreativeDirectionContextValue {
    const context = useContext(CreativeDirectionContext);
    if (!context) {
        throw new Error('useCreativeDirectionContext must be used within a CreativeDirectionProvider');
    }
    return context;
}
