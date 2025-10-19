import { useEffect, useRef, useState } from "react";

interface NooglesLogoProps {
  className?: string;
  textSize?: string;
}

export const NoobieLogo = ({ className = "", textSize = "text-5xl" }: NooglesLogoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculatePupilPosition = (eyeRef: HTMLDivElement | null) => {
    if (!eyeRef) return { x: 0, y: 0 };

    const eyeRect = eyeRef.getBoundingClientRect();
    const eyeCenterX = eyeRect.left + eyeRect.width / 2;
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;

    const angle = Math.atan2(
      mousePosition.y - eyeCenterY,
      mousePosition.x - eyeCenterX
    );

    // Maximum distance the pupil can move from center (smaller for tighter movement)
    const maxDistance = 6;
    const distance = Math.min(
      maxDistance,
      Math.sqrt(
        Math.pow(mousePosition.x - eyeCenterX, 2) +
          Math.pow(mousePosition.y - eyeCenterY, 2)
      ) / 20
    );

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    };
  };

  const [leftEyeRef, setLeftEyeRef] = useState<HTMLDivElement | null>(null);
  const [rightEyeRef, setRightEyeRef] = useState<HTMLDivElement | null>(null);

  const leftPupil = calculatePupilPosition(leftEyeRef);
  const rightPupil = calculatePupilPosition(rightEyeRef);

  return (
    <div ref={containerRef} className={`inline-flex items-center gap-0 ${className}`}>
      <span className={`${textSize} font-playfair font-bold tracking-tight text-white`}>N</span>
      
      {/* First eye (first "o") */}
      <div
        ref={setLeftEyeRef}
        className="relative inline-flex items-center justify-center mx-1"
        style={{
          width: "1em",
          height: "1em",
          fontSize: textSize.includes("5xl") ? "3rem" : textSize.includes("3xl") ? "1.875rem" : "1.5rem",
        }}
      >
        {/* Eye white */}
        <div className="absolute inset-0 rounded-full bg-background border-[6px] border-primary" />
        
        {/* Iris */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[60%] h-[60%] rounded-full bg-primary/80 flex items-center justify-center transition-transform duration-100 ease-out"
            style={{
              transform: `translate(${leftPupil.x}px, ${leftPupil.y}px)`,
            }}
          >
            {/* Pupil */}
            <div className="w-[45%] h-[45%] rounded-full bg-foreground" />
            {/* Light reflection */}
            <div className="absolute top-[20%] left-[30%] w-[25%] h-[25%] rounded-full bg-background/60" />
          </div>
        </div>
      </div>

      {/* Second eye (second "o") */}
      <div
        ref={setRightEyeRef}
        className="relative inline-flex items-center justify-center mx-1"
        style={{
          width: "1em",
          height: "1em",
          fontSize: textSize.includes("5xl") ? "3rem" : textSize.includes("3xl") ? "1.875rem" : "1.5rem",
        }}
      >
        {/* Eye white */}
        <div className="absolute inset-0 rounded-full bg-background border-[6px] border-primary" />
        
        {/* Iris */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[60%] h-[60%] rounded-full bg-primary/80 flex items-center justify-center transition-transform duration-100 ease-out"
            style={{
              transform: `translate(${rightPupil.x}px, ${rightPupil.y}px)`,
            }}
          >
            {/* Pupil */}
            <div className="w-[45%] h-[45%] rounded-full bg-foreground" />
            {/* Light reflection */}
            <div className="absolute top-[20%] left-[30%] w-[25%] h-[25%] rounded-full bg-background/60" />
          </div>
        </div>
      </div>

      <span className={`${textSize} font-playfair font-bold tracking-tight text-white`}>bie</span>
    </div>
  );
};
