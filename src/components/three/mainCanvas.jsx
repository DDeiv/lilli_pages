'use client'
import { useState, useEffect } from "react";
import { Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Model } from "./modelScene";
import { CameraFPS } from "./cameraControlFPS";
import { MobileShelfView } from "./MobileShelfView";
import { CursorHintWrapper } from "./CursorHintWrapper";
import { CashierDialogue } from "./CashierDialogue";
import { ScrollBlockOverlay } from "./ScrollBlockOverlay";
import { useIsMobile } from "../../hooks/useIsMobile";

export function MainCanvas({ sceneItems = [], active = true }) {
    const [mounted, setMounted] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="w-screen h-screen fixed top-0 left-0">
            <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ fov: 55, position: [0, 3, 10] }}
                frameloop={active ? "always" : "never"}
            >
                <Environment files="/images/path.jpg" />
                {/* Unified scene with cashier and shelves */}
                <Model sceneItems={sceneItems} />

                {/* Camera controls - now with custom scroll handling */}
                {mounted && (isMobile ? <MobileShelfView active={active} /> : <CameraFPS active={active} />)}
                {!mounted && <CameraFPS active={active} />}
            </Canvas>

            {/* UI Elements - only show when active */}
            <div className={active ? "opacity-100 transition-opacity duration-300" : "opacity-0 pointer-events-none"}>
                {/* Scroll blocking overlay - prevents scroll during dialogue */}
                {active && <ScrollBlockOverlay />}
                {/* Cashier Dialogue - shows on initial load */}
                {active && <CashierDialogue />}

                {/* Center pointer (crosshair) - only on desktop */}
                {mounted && !isMobile && active && (
                    <div className="pointer-events-none fixed top-1/2 left-1/2 z-50 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-md"></div>
                )}
                {/* Cursor hint message - only on desktop */}
                {mounted && !isMobile && active && <CursorHintWrapper />}

                {/* Mobile instructions */}
                {mounted && isMobile && active && (
                    <div
                        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 text-xs text-white pointer-events-none"
                        style={{
                            background: 'rgba(0, 0, 0, 0.7)',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            fontFamily: 'Courier New, monospace',
                            textAlign: 'center'
                        }}
                    >
                        SWIPE LEFT/RIGHT TO BROWSE • TAP OBJECTS TO INSPECT
                    </div>
                )}
            </div>
        </div>
    );
}
