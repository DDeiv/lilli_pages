'use client'
import { usePathname } from 'next/navigation'
import { MainCanvas } from './three/mainCanvas'

export function SceneWrapper({ sceneItems }) {
    const pathname = usePathname()
    const isHome = pathname === '/'

    return (
        <div
            className={`fixed inset-0 z-0 transition-opacity duration-500 ${isHome ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            aria-hidden={!isHome}
            style={{ pointerEvents: isHome ? 'auto' : 'none' }}
            suppressHydrationWarning
        >
            <MainCanvas sceneItems={sceneItems} active={isHome} />
        </div>
    )
}
