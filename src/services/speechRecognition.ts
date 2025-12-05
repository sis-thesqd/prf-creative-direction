/**
 * Speech Recognition Service
 *
 * Cross-browser Web Speech API service for voice-to-text functionality.
 */

// ============================================================================
// Types
// ============================================================================

export interface SpeechRecognitionEvent {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
}

export interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

export interface SpeechRecognitionInstance extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
}

export interface SpeechRecognitionConstructor {
    new (): SpeechRecognitionInstance;
}

interface WindowWithSpeechRecognition extends Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Check if the Web Speech API is supported in the current browser
 */
export function isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as WindowWithSpeechRecognition;
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
}

/**
 * Get the SpeechRecognition constructor (cross-browser)
 */
export function getSpeechRecognitionAPI(): SpeechRecognitionConstructor | null {
    if (typeof window === 'undefined') return null;
    const win = window as WindowWithSpeechRecognition;
    return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

/**
 * Create a new SpeechRecognition instance with default configuration
 */
export function createSpeechRecognition(options: {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
} = {}): SpeechRecognitionInstance | null {
    const SpeechRecognitionAPI = getSpeechRecognitionAPI();
    if (!SpeechRecognitionAPI) return null;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? true;
    recognition.lang = options.lang ?? 'en-US';

    return recognition;
}

/**
 * Get a human-readable error message for speech recognition errors
 */
export function getSpeechErrorMessage(error: string): string {
    switch (error) {
        case 'no-speech':
            return 'No speech was detected. Please try again.';
        case 'audio-capture':
            return 'No microphone was found. Please ensure a microphone is connected.';
        case 'not-allowed':
            return 'Microphone access was denied. Please allow microphone access and try again.';
        case 'network':
            return 'Network error occurred. Please check your connection and try again.';
        case 'aborted':
            return 'Speech recognition was aborted.';
        case 'language-not-supported':
            return 'The language is not supported.';
        case 'service-not-allowed':
            return 'Speech recognition service is not allowed.';
        default:
            return `Speech recognition error: ${error}`;
    }
}
