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
import { PostFX } from "./PostFX";
import { useIsMobile } from "../../hooks/useIsMobile";
import { SLUDGE } from "@/lib/theme";
import { useSceneStore } from "@/store/useSceneStore";

export function MainCanvas({ sceneItems = [], active = true }) {
    const [mounted, setMounted] = useState(false);
    const isMobile = useIsMobile();
    const mobilePhase = useSceneStore((state) => state.mobilePhase);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        // touchAction none: swipes on the 3D scene must never become
        // native scrolls (iOS pull-to-refresh, bounce)
        <div className="w-screen h-screen fixed top-0 left-0" style={{ touchAction: 'none' }}>
            <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ fov: 68, position: [0, 3, 10] }}
                frameloop={active ? "always" : "never"}
            >
                {/* Sludge Life atmosphere: smoggy sky + hazy fog */}
                <color attach="background" args={[SLUDGE.fog]} />
                <fog attach="fog" args={[SLUDGE.fog, SLUDGE.fogNear, SLUDGE.fogFar]} />
                <Environment files="/images/path.jpg" />
                {/* Unified scene with cashier and shelves */}
                <Model sceneItems={sceneItems} active={active} isMobile={isMobile} />
                {/* Digital grime: RGB shift, scanlines, grain, vignette */}
                <PostFX />

                {/* Camera controls - now with custom scroll handling */}
                {mounted && (isMobile
                    ? <MobileShelfView active={active} itemCount={sceneItems.length} />
                    : <CameraFPS active={active} itemCount={sceneItems.length} />)}
                {!mounted && <CameraFPS active={active} itemCount={sceneItems.length} />}
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
                        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 text-xs pointer-events-none"
                        style={{
                            background: SLUDGE.ui.panel,
                            border: `2px solid ${SLUDGE.ui.border}`,
                            borderRadius: '2px',
                            boxShadow: '3px 3px 0px rgba(0,0,0,0.35)',
                            color: SLUDGE.ui.text,
                            fontFamily: SLUDGE.ui.font,
                            fontWeight: 'bold',
                            letterSpacing: '0.5px',
                            textAlign: 'center'
                        }}
                    >
                        {mobilePhase === 'approach'
                            ? 'SWIPE UP TO WALK IN'
                            : 'SWIPE LEFT/RIGHT TO BROWSE • TAP OBJECTS TO INSPECT'}
                    </div>
                )}
            </div>
        </div>
    );
}
