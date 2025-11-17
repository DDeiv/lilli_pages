'use client'

import { useSceneStore } from '@/store/useSceneStore'

export function ScrollBlockOverlay() {
  const showScrollBlock = useSceneStore((state) => state.showScrollBlock)

  if (!showScrollBlock) return null

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-auto"
      style={{ background: 'transparent' }}
    />
  )
}
