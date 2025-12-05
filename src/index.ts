/**
 * PRF Creative Direction Package
 *
 * Component and utilities for the creative direction step (step 4) of the PRF form.
 */

// Components
export {
    CreativeDirection,
    TrustSquadToggle,
    VisionTextarea,
    FileUploader,
    SpeechToTextButton,
} from './components/prf/creative-direction';

// Base components
export { Button } from './components/base/buttons/button';
export { Toggle, ToggleBase } from './components/base/toggle/toggle';

// Hooks
export { useCreativeVisionEnhancer } from './hooks/useCreativeVisionEnhancer';
export { useSpeechRecognition } from './hooks/useSpeechRecognition';
export { useCompactLayout } from './hooks/useCompactLayout';

// Store
export { useCreativeDirectionStore } from './store/creativeDirectionStore';

// Context
export { CreativeDirectionProvider, useCreativeDirectionContext } from './context/CreativeDirectionContext';

// Services
export { generateCreativeVision, feelingLucky, enhanceVision } from './services/api/creativeVision';
export { uploadFile, uploadFiles } from './services/api/upload';
export {
    isSpeechRecognitionSupported,
    createSpeechRecognition,
    getSpeechErrorMessage,
} from './services/speechRecognition';

// Types
export type {
    CreativeDirectionState,
    CreativeDirectionProps,
    CreativeDirectionApiConfig,
    CreativeDirectionStoreState,
    CreativeDirectionContextValue,
    TrustSquadToggleProps,
    VisionTextareaProps,
    FileUploaderProps,
    UploadedFile,
    GeneralInfoState,
    DesignStyleState,
    CreativeVisionRequest,
    CreativeVisionResponse,
    UploadResponse,
} from './types/creativeDirection';

// Utils
export { cx, sortCx } from './utils/cx';
