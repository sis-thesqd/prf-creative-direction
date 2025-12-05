/**
 * useCreativeVisionEnhancer Hook
 *
 * React hook for AI-powered creative vision generation and enhancement.
 */

import { useState, useCallback, useRef } from 'react';
import { feelingLucky, enhanceVision } from '../services/api/creativeVision';
import type {
    CreativeDirectionApiConfig,
    GeneralInfoState,
    DesignStyleState,
} from '../types/creativeDirection';

export interface UseCreativeVisionEnhancerOptions {
    /** API configuration */
    apiConfig?: CreativeDirectionApiConfig;
    /** General info state for AI context */
    generalInfo?: GeneralInfoState;
    /** Design style state for AI context */
    designStyle?: DesignStyleState;
    /** Callback when vision is updated */
    onVisionChange?: (vision: string) => void;
    /** Callback when an error occurs */
    onError?: (error: string) => void;
}

export interface UseCreativeVisionEnhancerReturn {
    /** Whether an AI request is in progress */
    isLoading: boolean;
    /** Generate a new vision from scratch */
    handleFeelingLucky: () => Promise<void>;
    /** Enhance the current vision */
    handleEnhance: (currentVision: string) => Promise<void>;
    /** Undo the last vision change */
    handleUndo: () => void;
    /** Whether undo is available */
    canUndo: boolean;
    /** Error message if any */
    error: string | null;
}

export function useCreativeVisionEnhancer(
    options: UseCreativeVisionEnhancerOptions = {}
): UseCreativeVisionEnhancerReturn {
    const { apiConfig, generalInfo, designStyle, onVisionChange, onError } = options;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const previousVisionRef = useRef<string | null>(null);

    const handleFeelingLucky = useCallback(async () => {
        if (!apiConfig?.creativeVisionEndpoint) {
            const err = 'Creative vision endpoint not configured';
            setError(err);
            onError?.(err);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await feelingLucky(apiConfig, generalInfo, designStyle);

            if (response.error) {
                setError(response.error);
                onError?.(response.error);
                return;
            }

            if (response.data?.vision) {
                previousVisionRef.current = '';
                onVisionChange?.(response.data.vision);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate vision';
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [apiConfig, generalInfo, designStyle, onVisionChange, onError]);

    const handleEnhance = useCallback(
        async (currentVision: string) => {
            if (!apiConfig?.creativeVisionEndpoint) {
                const err = 'Creative vision endpoint not configured';
                setError(err);
                onError?.(err);
                return;
            }

            if (!currentVision.trim()) {
                const err = 'No vision to enhance';
                setError(err);
                onError?.(err);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await enhanceVision(currentVision, apiConfig, generalInfo, designStyle);

                if (response.error) {
                    setError(response.error);
                    onError?.(response.error);
                    return;
                }

                if (response.data?.vision) {
                    previousVisionRef.current = currentVision;
                    onVisionChange?.(response.data.vision);
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to enhance vision';
                setError(errorMessage);
                onError?.(errorMessage);
            } finally {
                setIsLoading(false);
            }
        },
        [apiConfig, generalInfo, designStyle, onVisionChange, onError]
    );

    const handleUndo = useCallback(() => {
        if (previousVisionRef.current !== null) {
            onVisionChange?.(previousVisionRef.current);
            previousVisionRef.current = null;
        }
    }, [onVisionChange]);

    return {
        isLoading,
        handleFeelingLucky,
        handleEnhance,
        handleUndo,
        canUndo: previousVisionRef.current !== null,
        error,
    };
}
