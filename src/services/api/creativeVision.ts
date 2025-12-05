/**
 * Creative Vision API Service
 *
 * API service for AI-powered creative vision generation and enhancement.
 */

import type {
    CreativeDirectionApiConfig,
    CreativeVisionRequest,
    CreativeVisionResponse,
    GeneralInfoState,
    DesignStyleState,
} from '../../types/creativeDirection';

const DEFAULT_ENDPOINT = '/api/creative-direction/creative-vision';

/**
 * Generate or enhance creative vision using AI
 */
export async function generateCreativeVision(
    request: CreativeVisionRequest,
    config: CreativeDirectionApiConfig = {}
): Promise<CreativeVisionResponse> {
    const endpoint = config.creativeVisionEndpoint || DEFAULT_ENDPOINT;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                data: null,
                error: errorData.error || `Request failed with status ${response.status}`,
            };
        }

        const data = await response.json();
        return {
            data: data.data,
            error: null,
        };
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Failed to generate creative vision',
        };
    }
}

/**
 * "I'm Feeling Lucky" - Generate a creative vision from scratch
 */
export async function feelingLucky(
    config: CreativeDirectionApiConfig,
    generalInfo?: GeneralInfoState,
    designStyle?: DesignStyleState
): Promise<CreativeVisionResponse> {
    return generateCreativeVision(
        {
            buttonType: 'feelingLucky',
            generalInfo,
            designStyle,
        },
        config
    );
}

/**
 * "Enhance" - Improve existing creative vision
 */
export async function enhanceVision(
    currentVision: string,
    config: CreativeDirectionApiConfig,
    generalInfo?: GeneralInfoState,
    designStyle?: DesignStyleState
): Promise<CreativeVisionResponse> {
    return generateCreativeVision(
        {
            buttonType: 'enhance',
            currentVision,
            generalInfo,
            designStyle,
        },
        config
    );
}
