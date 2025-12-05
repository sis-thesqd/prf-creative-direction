/**
 * Creative Direction Types
 *
 * Type definitions for the PRF Creative Direction package.
 */

/**
 * Uploaded file information
 */
export interface UploadedFile {
    id: string;
    url: string;
    filename: string;
    size: number;
    type: string;
    description?: string;
}

/**
 * Creative direction form state
 */
export interface CreativeDirectionState {
    trustSquad: boolean;
    vision: string;
    uploadedFiles: UploadedFile[];
    fileDescriptions: Record<string, string>;
}

/**
 * API configuration for creative direction endpoints
 */
export interface CreativeDirectionApiConfig {
    /** Endpoint for creative vision AI enhancement */
    creativeVisionEndpoint?: string;
    /** Endpoint for file upload */
    uploadEndpoint?: string;
}

/**
 * General info state (from step 1) - used for AI context
 */
export interface GeneralInfoState {
    projectName?: string;
    projectDescription?: string;
    ministries?: string[];
    [key: string]: unknown;
}

/**
 * Design style state (from step 3) - used for AI context
 */
export interface DesignStyleState {
    selectedStyle?: string | null;
    selectedStyleGuideId?: string | null;
    [key: string]: unknown;
}

/**
 * Props for the main CreativeDirection component
 */
export interface CreativeDirectionProps {
    /** Initial state */
    initialState?: Partial<CreativeDirectionState>;
    /** Callback when state changes */
    onStateChange?: (state: CreativeDirectionState) => void;
    /** Callback when user clicks back */
    onBack?: () => void;
    /** Callback when user clicks continue */
    onContinue?: (state: CreativeDirectionState) => Promise<void>;
    /** API configuration */
    apiConfig?: CreativeDirectionApiConfig;
    /** Custom class name */
    className?: string;
    /** Analytics tracking function */
    trackEvent?: (eventName: string, properties: Record<string, unknown>) => void;
    /** General info state from step 1 (for AI context) */
    generalInfo?: GeneralInfoState;
    /** Design style state from step 3 (for AI context) */
    designStyle?: DesignStyleState;
    /** Whether continue is disabled */
    isContinueDisabled?: boolean;
    /** Whether loading */
    isLoading?: boolean;
}

/**
 * Zustand store state for creative direction
 */
export interface CreativeDirectionStoreState {
    /** Current creative direction state */
    creativeDirectionState: CreativeDirectionState;
    /** Update creative direction state */
    updateCreativeDirectionState: (updates: Partial<CreativeDirectionState>) => void;
    /** Reset creative direction state */
    resetCreativeDirectionState: () => void;
    /** Set entire creative direction state */
    setCreativeDirectionState: (state: CreativeDirectionState) => void;
}

/**
 * Context value for creative direction provider
 */
export interface CreativeDirectionContextValue {
    /** API configuration */
    apiConfig: CreativeDirectionApiConfig;
}

/**
 * Props for TrustSquadToggle component
 */
export interface TrustSquadToggleProps {
    /** Whether trust squad is enabled */
    isEnabled: boolean;
    /** Callback when toggle changes */
    onChange: (enabled: boolean) => void;
    /** Custom class name */
    className?: string;
}

/**
 * Props for VisionTextarea component
 */
export interface VisionTextareaProps {
    /** Current vision text */
    value: string;
    /** Callback when vision changes */
    onChange: (value: string) => void;
    /** Whether to show AI buttons */
    showAiButtons?: boolean;
    /** API config for AI features */
    apiConfig?: CreativeDirectionApiConfig;
    /** General info for AI context */
    generalInfo?: GeneralInfoState;
    /** Design style for AI context */
    designStyle?: DesignStyleState;
    /** Custom class name */
    className?: string;
    /** Whether the field is disabled */
    isDisabled?: boolean;
}

/**
 * Props for FileUploader component
 */
export interface FileUploaderProps {
    /** Current uploaded files */
    files: UploadedFile[];
    /** File descriptions */
    fileDescriptions: Record<string, string>;
    /** Callback when files change */
    onFilesChange: (files: UploadedFile[]) => void;
    /** Callback when file descriptions change */
    onDescriptionsChange: (descriptions: Record<string, string>) => void;
    /** API config for upload endpoint */
    apiConfig?: CreativeDirectionApiConfig;
    /** Custom class name */
    className?: string;
    /** Whether the uploader is disabled */
    isDisabled?: boolean;
}

/**
 * Creative vision API request payload
 */
export interface CreativeVisionRequest {
    buttonType: 'feelingLucky' | 'enhance';
    generalInfo?: GeneralInfoState;
    designStyle?: DesignStyleState;
    currentVision?: string;
    trustSquad?: boolean;
}

/**
 * Creative vision API response
 */
export interface CreativeVisionResponse {
    data: {
        vision?: string;
        [key: string]: unknown;
    } | null;
    error: string | null;
}

/**
 * Upload API response
 */
export interface UploadResponse {
    data: {
        url: string;
        filename: string;
        key: string;
        size: number;
        description?: string;
    } | null;
    error: string | null;
}
