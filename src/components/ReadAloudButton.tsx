import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    // New text (e.g. next question): stop any leftover speech.
    setIsSpeaking(false);
    stopSpeaking();
  }, [text]);

  useEffect(() => () => stopSpeaking(), []);

  if (!isSpeechSupported()) return null;

  const handleClick = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speak(text, { onEnd: () => setIsSpeaking(false) });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'}
      title={isSpeaking ? 'Stop reading' : 'Read aloud'}
      className={`inline-flex items-center justify-center w-11 h-11 rounded-full border border-border bg-card text-primary shadow-sm transition-all duration-200 hover:bg-primary/10 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isSpeaking ? 'bg-primary/15 ring-2 ring-primary/40 animate-pulse' : ''
      } ${className}`}
    >
      <Volume2 className="w-6 h-6" />
    </button>
  );
};

export default ReadAloudButton;
