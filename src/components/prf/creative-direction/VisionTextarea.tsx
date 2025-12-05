/**
 * VisionTextarea Component
 *
 * Textarea for creative vision with AI enhancement buttons and voice input.
 */

"use client";

import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Undo2 } from 'lucide-react';
import { Button } from '../../base/buttons/button';
import { SpeechToTextButton } from './SpeechToTextButton';
import { useCreativeVisionEnhancer } from '../../../hooks/useCreativeVisionEnhancer';
import { cx } from '../../../utils/cx';
import type { VisionTextareaProps } from '../../../types/creativeDirection';

const MAX_CHARACTERS = 1400;

export function VisionTextarea({
    value,
    onChange,
    showAiButtons = true,
    apiConfig,
    generalInfo,
    designStyle,
    className,
    isDisabled = false,
}: VisionTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [previousVision, setPreviousVision] = useState<string | null>(null);

    const {
        isLoading,
        handleFeelingLucky,
        handleEnhance,
        error,
    } = useCreativeVisionEnhancer({
        apiConfig,
        generalInfo,
        designStyle,
        onVisionChange: (newVision) => {
            setPreviousVision(value);
            onChange(newVision);
        },
    });

    const handleUndo = useCallback(() => {
        if (previousVision !== null) {
            onChange(previousVision);
            setPreviousVision(null);
        }
    }, [previousVision, onChange]);

    const handleTextChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newValue = e.target.value;
            if (newValue.length <= MAX_CHARACTERS) {
                onChange(newValue);
            }
        },
        [onChange]
    );

    const handleSpeechTranscript = useCallback(
        (transcript: string) => {
            const newValue = value ? `${value} ${transcript}` : transcript;
            if (newValue.length <= MAX_CHARACTERS) {
                onChange(newValue);
            }
        },
        [value, onChange]
    );

    const characterCount = value.length;
    const isEmpty = !value.trim();
    const canUndo = previousVision !== null;

    return (
        <div className={cx('flex flex-col gap-2', className)}>
            {/* Label row with character counter and AI buttons */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <label htmlFor="vision-textarea" className="text-sm font-medium text-secondary">
                        Creative Vision
                    </label>
                    <span className="text-xs text-tertiary">
                        {characterCount}/{MAX_CHARACTERS}
                    </span>
                </div>

                {showAiButtons && (
                    <div className="flex items-center gap-2">
                        {/* Undo button */}
                        <AnimatePresence>
                            {canUndo && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <Button
                                        color="link-gray"
                                        size="sm"
                                        onClick={handleUndo}
                                        iconLeading={Undo2}
                                        isDisabled={isLoading || isDisabled}
                                    >
                                        Undo
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* AI buttons - toggle between Feeling Lucky and Enhance */}
                        <AnimatePresence mode="wait">
                            {isEmpty ? (
                                <motion.div
                                    key="feeling-lucky"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <Button
                                        color="link-color"
                                        size="sm"
                                        onClick={handleFeelingLucky}
                                        iconLeading={Sparkles}
                                        isLoading={isLoading}
                                        isDisabled={isDisabled}
                                    >
                                        I'm Feeling Lucky
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="enhance"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <Button
                                        color="link-color"
                                        size="sm"
                                        onClick={() => handleEnhance(value)}
                                        iconLeading={Sparkles}
                                        isLoading={isLoading}
                                        isDisabled={isDisabled}
                                    >
                                        Enhance
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Textarea with speech button */}
            <div className="relative">
                <textarea
                    ref={textareaRef}
                    id="vision-textarea"
                    value={value}
                    onChange={handleTextChange}
                    disabled={isDisabled}
                    placeholder="Describe your creative vision for this project. What feeling should it evoke? What colors, imagery, or themes should we explore?"
                    className={cx(
                        'w-full min-h-[120px] resize-none rounded-xl border border-secondary bg-primary px-4 py-3 pr-12 text-sm text-primary placeholder:text-quaternary',
                        'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20',
                        'disabled:cursor-not-allowed disabled:bg-disabled_subtle disabled:text-disabled',
                        'transition-colors duration-150'
                    )}
                    rows={5}
                />

                {/* Speech-to-text button */}
                <div className="absolute right-3 bottom-3">
                    <SpeechToTextButton
                        onTranscriptionComplete={handleSpeechTranscript}
                    />
                </div>
            </div>

            {/* Hint text */}
            <p className="text-xs text-tertiary">
                Be as detailed or brief as you'd like. Our creative team will use this as a starting point for your project.
            </p>

            {/* Error message */}
            {error && (
                <p className="text-xs text-error-primary">{error}</p>
            )}
        </div>
    );
}
