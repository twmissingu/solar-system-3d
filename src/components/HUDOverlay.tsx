export default function HUDOverlay() {
  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      {/* Center crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="crosshair-pulse w-[2px] h-[2px] rounded-full bg-sci-cyan" />
      </div>

      {/* Corner bracket top-left */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 w-16 h-16 hud-corner opacity-30" />

      {/* Corner bracket bottom-right */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-16 h-16 hud-corner opacity-30" />
    </div>
  )
}
