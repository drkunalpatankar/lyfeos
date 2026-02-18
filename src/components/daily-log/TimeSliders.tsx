"use client";

import { Slider } from "@/components/ui/slider";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface TimeSlidersProps {
    initialWork?: number;
    initialPersonal?: number;
    initialHealth?: number;
    initialSleep?: number;
    onChange: (metrics: { work: number; personal: number; health: number; sleep: number }) => void;
}

export default function TimeSliders({
    initialWork = 8,
    initialPersonal = 8,
    initialHealth = 1,
    initialSleep = 7,
    onChange,
}: TimeSlidersProps) {
    const [work, setWork] = useState(initialWork);
    const [personal, setPersonal] = useState(initialPersonal);
    const [health, setHealth] = useState(initialHealth);
    const [sleep, setSleep] = useState(initialSleep);

    // Track which sliders have been manually adjusted (sticky behavior)
    const touchedRef = useRef({
        work: false,
        personal: false,
        health: false,
        sleep: false,
    });

    useEffect(() => {
        onChange({ work, personal, health, sleep });
    }, [work, personal, health, sleep, onChange]);

    // Smart redistribution - ensures total is always 24h
    const redistributeHours = (
        currentSlider: 'work' | 'personal' | 'health' | 'sleep',
        newValue: number
    ) => {
        // Enforce bounds immediately
        const safeValue = Math.max(0, Math.min(24, newValue));
        const pool = 24 - safeValue;

        // Get current values
        const values = { work, personal, health, sleep };

        // Identify other sliders
        const allKeys = ['work', 'personal', 'health', 'sleep'] as const;
        const otherKeys = allKeys.filter(k => k !== currentSlider);

        const touchedOthers = otherKeys.filter(k => touchedRef.current[k]);
        const untouchedOthers = otherKeys.filter(k => !touchedRef.current[k]);

        const currentTouchedSum = touchedOthers.reduce((sum, k) => sum + values[k], 0);

        // Strategy: First try to satisfy strict "lock" on touched sliders
        // Available for untouched = Total Pool - Sum of Touched Others
        let remainingForUntouched = pool - currentTouchedSum;

        const newValues = { ...values, [currentSlider]: safeValue };

        if (remainingForUntouched >= 0) {
            // CASE 1: We have enough space. Touched sliders stay fixed. 
            // We distribute `remainingForUntouched` among `untouchedOthers`.

            // Keep touched others as is
            // (They are already in newValues from spread, but let's be explicit if we want)

            // Distribute among untouched
            if (untouchedOthers.length > 0) {
                const currentUntouchedSum = untouchedOthers.reduce((sum, k) => sum + values[k], 0);

                if (currentUntouchedSum > 0) {
                    // Distribute proportionally to current values
                    const ratio = remainingForUntouched / currentUntouchedSum;
                    untouchedOthers.forEach(k => {
                        newValues[k] = values[k] * ratio;
                    });
                } else {
                    // If all untouched are 0, distribute equally
                    const equalShare = remainingForUntouched / untouchedOthers.length;
                    untouchedOthers.forEach(k => {
                        newValues[k] = equalShare;
                    });
                }
            } else {
                // No untouched sliders? Then we MUST distribute among touched (overflow case for logic)
                // This implies all 3 others are touched. 
                // We treat them as untouched for adjustment purposes to satisfy the 24h constraint.
                if (currentTouchedSum > 0) {
                    const ratio = pool / currentTouchedSum;
                    touchedOthers.forEach(k => {
                        newValues[k] = values[k] * ratio;
                    });
                }
            }
        } else {
            // CASE 2: Not enough space. `untouched` get squeezed to 0.
            // `touched` must also shrink to fit the pool.

            untouchedOthers.forEach(k => {
                newValues[k] = 0;
            });

            // Distribute `pool` among `touchedOthers` proportionally
            if (currentTouchedSum > 0) {
                const ratio = pool / currentTouchedSum;
                touchedOthers.forEach(k => {
                    newValues[k] = values[k] * ratio;
                });
            } else {
                // Should theoretically not happen if remainingForUntouched < 0 (meaning pool < currentTouchedSum)
                // But safety fallback:
                const equalShare = pool / touchedOthers.length;
                touchedOthers.forEach(k => {
                    newValues[k] = equalShare;
                });
            }
        }

        return newValues;
    };

    const handleWorkChange = (newValue: number) => {
        touchedRef.current.work = true;
        const newValues = redistributeHours('work', newValue);
        setWork(newValues.work);
        setPersonal(newValues.personal);
        setHealth(newValues.health);
        setSleep(newValues.sleep);
    };

    const handlePersonalChange = (newValue: number) => {
        touchedRef.current.personal = true;
        const newValues = redistributeHours('personal', newValue);
        setWork(newValues.work);
        setPersonal(newValues.personal);
        setHealth(newValues.health);
        setSleep(newValues.sleep);
    };

    const handleHealthChange = (newValue: number) => {
        touchedRef.current.health = true;
        const newValues = redistributeHours('health', newValue);
        setWork(newValues.work);
        setPersonal(newValues.personal);
        setHealth(newValues.health);
        setSleep(newValues.sleep);
    };

    const handleSleepChange = (newValue: number) => {
        touchedRef.current.sleep = true;
        const newValues = redistributeHours('sleep', newValue);
        setWork(newValues.work);
        setPersonal(newValues.personal);
        setHealth(newValues.health);
        setSleep(newValues.sleep);
    };

    const totalHours = work + personal + health + sleep;

    return (
        <div className="space-y-8 w-full">
            <div className="flex justify-between items-center pb-3 border-b border-amber-200/10">
                <span className="text-sm font-light text-amber-200/60">
                    Total: {totalHours.toFixed(1)}h / 24h
                </span>
            </div>

            {/* Work Slider */}
            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-blue-300 font-light">
                        Work {touchedRef.current.work && "🔒"}
                    </span>
                    <span className="font-light text-amber-100">{work.toFixed(1)}h</span>
                </div>
                <Slider
                    value={[work]}
                    max={24}
                    step={0.5}
                    onValueChange={(val) => handleWorkChange(val[0])}
                    rangeClassName="bg-gradient-to-r from-blue-400 to-blue-500"
                    thumbClassName="border-blue-400"
                    trackClassName="bg-white/5"
                />
            </div>

            {/* Personal Slider */}
            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-rose-300 font-light">
                        Personal {touchedRef.current.personal && "🔒"}
                    </span>
                    <span className="font-light text-amber-100">{personal.toFixed(1)}h</span>
                </div>
                <Slider
                    value={[personal]}
                    max={24}
                    step={0.5}
                    onValueChange={(val) => handlePersonalChange(val[0])}
                    rangeClassName="bg-gradient-to-r from-rose-400 to-rose-500"
                    thumbClassName="border-rose-400"
                    trackClassName="bg-white/5"
                />
            </div>

            {/* Health Slider */}
            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-emerald-300 font-light">
                        Health {touchedRef.current.health && "🔒"}
                    </span>
                    <span className="font-light text-amber-100">{health.toFixed(1)}h</span>
                </div>
                <Slider
                    value={[health]}
                    max={24}
                    step={0.5}
                    onValueChange={(val) => handleHealthChange(val[0])}
                    rangeClassName="bg-gradient-to-r from-emerald-400 to-emerald-500"
                    thumbClassName="border-emerald-400"
                    trackClassName="bg-white/5"
                />
            </div>

            {/* Sleep Slider */}
            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-indigo-300 font-light">
                        Sleep {touchedRef.current.sleep && "🔒"}
                    </span>
                    <span className="font-light text-amber-100">{sleep.toFixed(1)}h</span>
                </div>
                <Slider
                    value={[sleep]}
                    max={24}
                    step={0.5}
                    onValueChange={(val) => handleSleepChange(val[0])}
                    rangeClassName="bg-gradient-to-r from-indigo-400 to-indigo-500"
                    thumbClassName="border-indigo-400"
                    trackClassName="bg-white/5"
                />
            </div>
        </div>
    );
}
