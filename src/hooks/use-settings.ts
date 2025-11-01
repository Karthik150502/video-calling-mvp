"use client";

import { useEffect, useState } from "react";

export function useAddtionalCallSettings() {

    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [showControls, setShowControls] = useState<boolean>(isFullscreen);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

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
        showControls,
        setShowControls
    }

}