interface WaveformIconProps {
  className?: string;
  isAnimating?: boolean;
}

export function WaveformIcon({
  className = "",
  isAnimating = false,
}: WaveformIconProps) {
  return (
    <div className={`flex items-end gap-[2px] h-5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full bg-current ${isAnimating ? "wave-bar" : ""}`}
          style={{
            height: isAnimating ? "100%" : `${[40, 65, 100, 75, 50][i - 1]}%`,
            animationDelay: isAnimating ? `${(i - 1) * 0.12}s` : undefined,
          }}
        />
      ))}
    </div>
  );
}
