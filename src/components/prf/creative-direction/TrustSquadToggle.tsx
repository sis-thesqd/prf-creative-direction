/**
 * TrustSquadToggle Component
 *
 * Toggle for enabling "Trust TheSquad" mode.
 * When enabled, the creative direction fields are hidden and TheSquad handles the creative vision.
 */

"use client";

import React from 'react';
import { Toggle } from '../../base/toggle/toggle';
import { cx } from '../../../utils/cx';
import type { TrustSquadToggleProps } from '../../../types/creativeDirection';

export function TrustSquadToggle({ isEnabled, onChange, className }: TrustSquadToggleProps) {
    return (
        <div className={cx('flex items-start justify-between gap-4 rounded-xl border border-secondary bg-primary p-4', className)}>
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <span className="text-md font-medium text-primary">Trust TheSquad</span>
                    <span className="rounded-full bg-brand-secondary px-2 py-0.5 text-xs font-medium text-brand-primary">Recommended</span>
                </div>
                <p className="text-sm text-tertiary">
                    We'll pass off the creative reins to TheSquad! We trust them to create fresh, custom designs that match our vision.
                </p>
            </div>
            <Toggle
                isSelected={isEnabled}
                onChange={onChange}
                size="md"
            />
        </div>
    );
}
