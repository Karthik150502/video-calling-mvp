"use client";

import { useEffect, useRef, useState } from "react";

export function useAddtionalCallSettings() {

    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [showControls, setShowControls] = useState<boolean>(isFullscreen);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleMoudeMove = () => {
            setShowControls(true)
        }
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        window.addEventListener("mouseover", handleMoudeMove);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            window.removeEventListener("mouseover", handleMoudeMove);
        }
    }, [])

    useEffect(() => {
        let timer = timerRef.current;
        if (showControls) {
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                setShowControls(false)
            }, 5000)
        }

        return () => {
            if (timer) {
                clearTimeout(timer)
            }
        }
    }, [showControls])

    const toggleFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(console.error);
        } else {
            document.documentElement.requestFullscreen().catch(console.error)
        }
    };

    return {
        toggleFullscreen,
        isFullscreen,
        showControls
    }

}