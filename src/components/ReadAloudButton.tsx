import React, { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speak, stopSpeaking, isSpeechSupported } from '@/lib/speech';

interface ReadAloudButtonProps {
  /** The text to read aloud when tapped. */
  text: string;
  className?: string;
}

/**
 * Kid-sized speaker button that reads the given text aloud.
 * Stops speech automatically when the text changes or the button unmounts.
 */
const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({ text, className = '' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSafety = () => {
    if (safetyTimer.current) {
      clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }
  };

  useEffect(() => {
    setIsSpeaking(false);
    clearSafety();
    stopSpeaking();
  }, [text]);

  useEffect(
    () => () => {
      clearSafety();
      stopSpeaking();
    },
    []
  );

  if (!isSpeechSupported()) return null;

  const handleClick = () => {
    if (isSpeaking) {
      clearSafety();
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const queued = speak(text, {
      onEnd: () => {
        clearSafety();
        setIsSpeaking(false);
      },
    });

    if (!queued) {
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    // Safety: never leave the button stuck if onend never fires (some WebViews).
    clearSafety();
    safetyTimer.current = setTimeout(() => setIsSpeaking(false), 30000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'}
      title={isSpeaking ? 'Stop reading' : 'Read aloud'}
      className={`inline-flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] rounded-full border border-border bg-card text-primary shadow-sm transition-all duration-200 hover:bg-primary/10 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer touch-manipulation ${
        isSpeaking ? 'bg-primary/15 ring-2 ring-primary/40 animate-pulse' : ''
      } ${className}`}
    >
      <Volume2 className="w-6 h-6" />
    </button>
  );
};

export default ReadAloudButton;
