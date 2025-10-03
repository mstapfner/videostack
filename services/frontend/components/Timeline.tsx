interface TimelineProps {
  totalDuration: number;
  pixelsPerSecond?: number;
}

export function Timeline({ totalDuration, pixelsPerSecond = 60 }: TimelineProps) {
  const totalWidth = totalDuration * pixelsPerSecond;
  
  // Create markers every 5 seconds
  const majorMarks = [];
  for (let i = 0; i <= totalDuration; i += 5) {
    majorMarks.push(i);
  }
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-neutral-900/30 border-b border-neutral-800">
      <div 
        className="h-12 relative overflow-hidden"
        style={{ width: Math.max(totalWidth, 400) }}
      >
        {/* Major time markers every 5 seconds */}
        {majorMarks.map((seconds) => (
          <div
            key={seconds}
            className="absolute top-0 h-full"
            style={{ left: seconds * pixelsPerSecond }}
          >
            {/* Vertical line */}
            <div className="w-px h-full bg-neutral-800"></div>
            
            {/* Time label */}
            <div className="absolute top-2 left-2 text-sm text-white font-mono">
              {formatTime(seconds)}
            </div>
          </div>
        ))}
        
        {/* Minor markers every 1 second */}
        {Array.from({ length: totalDuration + 1 }, (_, i) => i)
          .filter(i => i % 5 !== 0) // Skip major marks
          .map((seconds) => (
            <div
              key={`minor-${seconds}`}
              className="absolute top-8 w-px h-4 bg-neutral-800/50"
              style={{ left: seconds * pixelsPerSecond }}
            ></div>
          ))}
      </div>
    </div>
  );
}

