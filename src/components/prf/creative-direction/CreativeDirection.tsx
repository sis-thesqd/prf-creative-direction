/**
 * CreativeDirection Component
 *
 * Main component for the creative direction step (step 4) of the PRF form.
 * Includes trust squad toggle, vision textarea with AI enhancement, and file uploader.
 * Header/title should be rendered by the consuming application (project-ally).
 */

"use client";

import React, { useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../base/buttons/button';
import { TrustSquadToggle } from './TrustSquadToggle';
import { VisionTextarea } from './VisionTextarea';
import { FileUploader } from './FileUploader';
import { CreativeDirectionProvider } from '../../../context/CreativeDirectionContext';
import { useCreativeDirectionStore } from '../../../store/creativeDirectionStore';
import { cx } from '../../../utils/cx';
import type { CreativeDirectionProps, CreativeDirectionState } from '../../../types/creativeDirection';

const DEFAULT_STATE: CreativeDirectionState = {
    trustSquad: false,
    vision: '',
    uploadedFiles: [],
    fileDescriptions: {},
};

function CreativeDirectionContent({
    initialState,
    onStateChange,
    onBack,
    onContinue,
    apiConfig,
    className,
    trackEvent,
    generalInfo,
    designStyle,
    isContinueDisabled,
    isLoading,
}: Omit<CreativeDirectionProps, 'apiConfig'> & { apiConfig: NonNullable<CreativeDirectionProps['apiConfig']> }) {
    const {
        creativeDirectionState,
        updateCreativeDirectionState,
        setCreativeDirectionState,
        resetCreativeDirectionState,
    } = useCreativeDirectionStore();

    // Initialize state from props
    useEffect(() => {
        if (initialState) {
            setCreativeDirectionState({
                ...DEFAULT_STATE,
                ...initialState,
            });
        }
    }, []); // Only run once on mount

    // Notify parent of state changes
    useEffect(() => {
        onStateChange?.(creativeDirectionState);
    }, [creativeDirectionState, onStateChange]);

    const handleTrustSquadChange = useCallback(
        (enabled: boolean) => {
            updateCreativeDirectionState({ trustSquad: enabled });
            trackEvent?.('creative_direction_trust_squad_toggle', { enabled });
        },
        [updateCreativeDirectionState, trackEvent]
    );

    const handleVisionChange = useCallback(
        (vision: string) => {
            updateCreativeDirectionState({ vision });
        },
        [updateCreativeDirectionState]
    );

    const handleFilesChange = useCallback(
        (uploadedFiles: CreativeDirectionState['uploadedFiles']) => {
            updateCreativeDirectionState({ uploadedFiles });
            trackEvent?.('creative_direction_files_changed', { fileCount: uploadedFiles.length });
        },
        [updateCreativeDirectionState, trackEvent]
    );

    const handleDescriptionsChange = useCallback(
        (fileDescriptions: Record<string, string>) => {
            updateCreativeDirectionState({ fileDescriptions });
        },
        [updateCreativeDirectionState]
    );

    const handleClear = useCallback(() => {
        resetCreativeDirectionState();
        trackEvent?.('creative_direction_cleared', {});
    }, [resetCreativeDirectionState, trackEvent]);

    const handleBack = useCallback(() => {
        onBack?.();
        trackEvent?.('creative_direction_back', {});
    }, [onBack, trackEvent]);

    const handleContinue = useCallback(async () => {
        trackEvent?.('creative_direction_continue', {
            trustSquad: creativeDirectionState.trustSquad,
            hasVision: !!creativeDirectionState.vision.trim(),
            fileCount: creativeDirectionState.uploadedFiles.length,
        });
        await onContinue?.(creativeDirectionState);
    }, [creativeDirectionState, onContinue, trackEvent]);

    // Determine if there's any selection/content
    const hasContent = useMemo(() => {
        return (
            creativeDirectionState.trustSquad ||
            creativeDirectionState.vision.trim().length > 0 ||
            creativeDirectionState.uploadedFiles.length > 0
        );
    }, [creativeDirectionState]);

    // Continue should be enabled when trust squad is on OR when there's custom content
    const canContinue = useMemo(() => {
        if (isContinueDisabled) return false;
        return creativeDirectionState.trustSquad || hasContent;
    }, [creativeDirectionState.trustSquad, hasContent, isContinueDisabled]);

    return (
        <div className={cx('flex flex-col gap-6', className)}>
            {/* Trust Squad Toggle - always visible */}
            <TrustSquadToggle
                isEnabled={creativeDirectionState.trustSquad}
                onChange={handleTrustSquadChange}
            />

            {/* Vision and File Upload - hidden when trust squad is enabled */}
            <AnimatePresence>
                {!creativeDirectionState.trustSquad && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-6 overflow-hidden"
                    >
                        <VisionTextarea
                            value={creativeDirectionState.vision}
                            onChange={handleVisionChange}
                            showAiButtons={true}
                            apiConfig={apiConfig}
                            generalInfo={generalInfo}
                            designStyle={designStyle}
                            isDisabled={isLoading}
                        />

                        <FileUploader
                            files={creativeDirectionState.uploadedFiles}
                            fileDescriptions={creativeDirectionState.fileDescriptions}
                            onFilesChange={handleFilesChange}
                            onDescriptionsChange={handleDescriptionsChange}
                            apiConfig={apiConfig}
                            isDisabled={isLoading}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4">
                <Button
                    color="secondary"
                    size="md"
                    onClick={handleBack}
                    isDisabled={isLoading}
                >
                    Back
                </Button>

                <div className="flex items-center gap-3">
                    {hasContent && (
                        <Button
                            color="link-gray"
                            size="md"
                            onClick={handleClear}
                            isDisabled={isLoading}
                        >
                            Clear
                        </Button>
                    )}
                    <Button
                        color="primary"
                        size="md"
                        onClick={handleContinue}
                        isDisabled={!canContinue}
                        isLoading={isLoading}
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
}

/**
 * Main CreativeDirection component with provider wrapper
 */
export function CreativeDirection({ apiConfig = {}, ...props }: CreativeDirectionProps) {
    const config = useMemo(
        () => ({
            creativeVisionEndpoint: apiConfig.creativeVisionEndpoint,
            uploadEndpoint: apiConfig.uploadEndpoint,
        }),
        [apiConfig.creativeVisionEndpoint, apiConfig.uploadEndpoint]
    );

    return (
        <CreativeDirectionProvider apiConfig={config}>
            <CreativeDirectionContent apiConfig={config} {...props} />
        </CreativeDirectionProvider>
    );
}
