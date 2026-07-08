import React from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

interface CarouselControlsProps {
  isPlaying: boolean;
  onTogglePlayPause: () => void;
  onScrollToPrev: () => void;
  onScrollToNext: () => void;
}

const CarouselControls: React.FC<CarouselControlsProps> = ({
  isPlaying,
  onTogglePlayPause,
  onScrollToPrev,
  onScrollToNext,
}) => {
  return (
    <div className="flex justify-center gap-4 mb-8">
      <button
        onClick={onScrollToPrev}
        className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
        aria-label="التصميم السابق"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={onTogglePlayPause}
        className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
        aria-label={isPlaying ? "إيقاف التشغيل" : "تشغيل"}
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>

      <button
        onClick={onScrollToNext}
        className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
        aria-label="التصميم التالي"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default CarouselControls;
