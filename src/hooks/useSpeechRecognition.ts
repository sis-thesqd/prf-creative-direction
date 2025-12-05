/**
 * useSpeechRecognition Hook
 *
 * React hook for cross-browser speech recognition (Web Speech API).
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
    isSpeechRecognitionSupported,
    createSpeechRecognition,
    getSpeechErrorMessage,
    type SpeechRecognitionInstance,
    type SpeechRecognitionEvent,
    type SpeechRecognitionErrorEvent,
} from '../services/speechRecognition';

// ============================================================================
// Types
// ============================================================================

export interface UseSpeechRecognitionOptions {
    /** Callback when transcript is received */
    onTranscript?: (transcript: string) => void;
    /** Callback when an error occurs */
    onError?: (error: string) => void;
    /** Whether to use continuous recognition */
    continuous?: boolean;
    /** Whether to show interim results */
    interimResults?: boolean;
    /** Language for speech recognition */
    lang?: string;
}

export interface UseSpeechRecognitionReturn {
    /** Whether speech recognition is supported in this browser */
    isSupported: boolean;
    /** Whether speech recognition is currently active */
    isListening: boolean;
    /** Current transcript */
    transcript: string;
    /** Start speech recognition */
    startListening: () => void;
    /** Stop speech recognition */
    stopListening: () => void;
    /** Toggle speech recognition on/off */
    toggleListening: (initialTranscript?: string) => void;
    /** Reset the transcript */
    resetTranscript: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useSpeechRecognition(
    options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
    const {
        onTranscript,
        onError,
        continuous = false,
        interimResults = true,
        lang = 'en-US',
    } = options;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const initialTranscriptRef = useRef<string>('');
    const isSupported = isSpeechRecognitionSupported();

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
                recognitionRef.current = null;
            }
        };
    }, []);

    const startListening = useCallback(() => {
        if (!isSupported) {
            onError?.('Speech recognition is not supported in this browser.');
            return;
        }

        // Create new recognition instance
        const recognition = createSpeechRecognition({
            continuous,
            interimResults,
            lang,
        });

        if (!recognition) {
            onError?.('Failed to create speech recognition instance.');
            return;
        }

        recognitionRef.current = recognition;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            const currentTranscript = finalTranscript || interimTranscript;
            const fullTranscript = initialTranscriptRef.current
                ? `${initialTranscriptRef.current} ${currentTranscript}`
                : currentTranscript;

            setTranscript(fullTranscript);

            if (finalTranscript) {
                onTranscript?.(fullTranscript);
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            const message = getSpeechErrorMessage(event.error);
            onError?.(message);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            initialTranscriptRef.current = '';
        };

        try {
            recognition.start();
        } catch (error) {
            onError?.('Failed to start speech recognition.');
            setIsListening(false);
        }
    }, [isSupported, continuous, interimResults, lang, onTranscript, onError]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    const toggleListening = useCallback(
        (initialTranscript?: string) => {
            if (isListening) {
                stopListening();
            } else {
                initialTranscriptRef.current = initialTranscript || '';
                startListening();
            }
        },
        [isListening, startListening, stopListening]
    );

    const resetTranscript = useCallback(() => {
        setTranscript('');
        initialTranscriptRef.current = '';
    }, []);

    return {
        isSupported,
        isListening,
        transcript,
        startListening,
        stopListening,
        toggleListening,
        resetTranscript,
    };
}
