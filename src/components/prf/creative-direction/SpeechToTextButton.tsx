/**
 * Speech To Text Button Component
 *
 * Microphone button for voice-to-text input.
 */

"use client";

import React, { useCallback } from 'react';
import { Mic, Square } from 'lucide-react';
import { cx } from '../../../utils/cx';
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition';

export interface SpeechToTextButtonProps {
    /** Callback when transcription is complete */
    onTranscriptionComplete: (text: string) => void;
    /** Whether the button is in active state */
    isActive?: boolean;
    /** Custom class name */
    className?: string;
}

export function SpeechToTextButton({
    onTranscriptionComplete,
    isActive = false,
    className,
}: SpeechToTextButtonProps) {
    const {
        isSupported,
        isListening,
        toggleListening,
    } = useSpeechRecognition({
        onTranscript: (transcript) => {
            if (transcript.trim()) {
                onTranscriptionComplete(transcript);
            }
        },
        continuous: true,
        interimResults: true,
    });

    // Don't render if not supported
    if (!isSupported) {
        return null;
    }

    const handleClick = useCallback(() => {
        toggleListening();
    }, [toggleListening]);

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cx(
                'p-2 rounded-lg transition-colors',
                isListening
                    ? 'bg-error-solid text-white animate-pulse'
                    : 'bg-secondary text-secondary hover:bg-tertiary hover:text-primary',
                className
            )}
            title={isListening ? 'Stop recording' : 'Start voice input'}
            aria-label={isListening ? 'Stop recording' : 'Start voice input'}
        >
            {isListening ? (
                <Square className="size-4" />
            ) : (
                <Mic className="size-4" />
            )}
        </button>
    );
}
