export default function DotMatrixBrand() {
  return (
    <div className="w-full overflow-hidden" aria-hidden="true">
      <div
        className="w-full text-center font-black text-white/15 select-none whitespace-nowrap uppercase pointer-events-none"
        style={{
          fontFamily: "var(--font-geist-sans), sans-serif",
          fontSize: "clamp(100px, 16vw, 320px)",
          lineHeight: 0.8,
          letterSpacing: "-0.04em",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%), radial-gradient(1.5px, rgba(0,0,0,1) 100%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%), radial-gradient(1.5px, rgba(0,0,0,1) 100%, rgba(0,0,0,0) 100%)",
          maskSize: "100% 100%, 6px 6px",
          WebkitMaskSize: "100% 100%, 6px 6px",
          maskComposite: "source-in",
          WebkitMaskComposite: "source-in",
        }}
      >
        THUMB-FREE
      </div>
    </div>
  );
}
