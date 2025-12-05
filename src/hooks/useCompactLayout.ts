/**
 * useCompactLayout Hook
 *
 * Hook to determine if compact layout should be used based on viewport height.
 */

import { useState, useEffect } from 'react';

/**
 * Hook to determine if compact layout should be used based on viewport height
 */
export function useCompactLayout(threshold: number = 800): boolean {
    const [isCompact, setIsCompact] = useState(false);

    useEffect(() => {
        const checkHeight = () => {
            setIsCompact(window.innerHeight < threshold);
        };

        // Check initial height
        checkHeight();

        // Add resize listener
        window.addEventListener('resize', checkHeight);

        return () => {
            window.removeEventListener('resize', checkHeight);
        };
    }, [threshold]);

    return isCompact;
}
