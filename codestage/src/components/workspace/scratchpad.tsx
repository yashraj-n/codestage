"use client"

import { Tldraw } from "tldraw"
import "tldraw/tldraw.css"

export function ScratchPad() {
  return (
    <div className="h-full w-full overflow-hidden rounded-lg bg-white">
      <Tldraw
        persistenceKey="codestage-scratchpad"
        hideUi={false}
      />
    </div>
  )
}

