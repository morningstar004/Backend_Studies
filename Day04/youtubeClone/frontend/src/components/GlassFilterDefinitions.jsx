export default function GlassFilterDefinitions() {
  return (
    <svg
      aria-hidden="true"
      className="glass-filter-definitions"
      focusable="false"
    >
      <filter
        id="glass-displacement"
        x="-20%"
        y="-20%"
        width="140%"
        height="140%"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.015 0.025"
          numOctaves="2"
          seed="8"
          result="glass-noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="glass-noise"
          scale="8"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
