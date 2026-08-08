// Shared text-to-speech helper built on the browser's Web Speech API.

const EMOJI_REGEX = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

export const isSpeechSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Remove emoji and collapse whitespace so the voice reads only real words. */
const cleanForSpeech = (text: string) =>
  text.replace(EMOJI_REGEX, ' ').replace(/\s+/g, ' ').trim();

export interface SpeakOptions {
  onEnd?: () => void;
}

/**
 * Speak text aloud with a slow, kid-friendly voice.
 * Cancels any speech already in progress.
 */
export const speak = (text: string, options?: SpeakOptions) => {
  if (!isSpeechSupported()) return;

  const cleaned = cleanForSpeech(text);
  if (!cleaned) return;

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.rate = 0.85;
  utterance.pitch = 1.15;
  if (options?.onEnd) {
    utterance.onend = options.onEnd;
    // Treat cancellation as ended so listeners don't get stuck.
    utterance.onerror = options.onEnd;
  }
  speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if (isSpeechSupported()) {
    speechSynthesis.cancel();
  }
};
