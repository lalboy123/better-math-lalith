// Shared text-to-speech helper built on the browser's Web Speech API.

const EMOJI_REGEX = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

let voicesPrimed = false;
let speakTimer: ReturnType<typeof setTimeout> | null = null;

export const isSpeechSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Remove emoji and collapse whitespace so the voice reads only real words. */
const cleanForSpeech = (text: string) =>
  text.replace(EMOJI_REGEX, ' ').replace(/\s+/g, ' ').trim();

const primeVoices = () => {
  if (!isSpeechSupported() || voicesPrimed) return;
  const load = () => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) voicesPrimed = true;
  };
  load();
  if (!voicesPrimed) {
    speechSynthesis.addEventListener('voiceschanged', load, { once: true });
  }
};

const pickEnglishVoice = (): SpeechSynthesisVoice | null => {
  if (!isSpeechSupported()) return null;
  const voices = speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith('en') && /child|kid|samantha|karen|moira/i.test(v.name)) ||
    voices.find((v) => v.lang.toLowerCase().startsWith('en-us')) ||
    voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
    null
  );
};

export interface SpeakOptions {
  onEnd?: () => void;
}

/**
 * Speak text aloud with a slow, kid-friendly voice.
 * Cancels any speech already in progress.
 * @returns true if speech was queued
 */
export const speak = (text: string, options?: SpeakOptions): boolean => {
  if (!isSpeechSupported()) {
    options?.onEnd?.();
    return false;
  }

  const cleaned = cleanForSpeech(text);
  if (!cleaned) {
    options?.onEnd?.();
    return false;
  }

  primeVoices();
  if (speakTimer) {
    clearTimeout(speakTimer);
    speakTimer = null;
  }
  speechSynthesis.cancel();

  // iOS WKWebView often needs a tick after cancel before speak works.
  speakTimer = setTimeout(() => {
    speakTimer = null;
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = 0.85;
    utterance.pitch = 1.15;
    const voice = pickEnglishVoice();
    if (voice) utterance.voice = voice;

    const finish = () => options?.onEnd?.();
    utterance.onend = finish;
    utterance.onerror = finish;
    speechSynthesis.speak(utterance);
  }, 40);

  return true;
};

export const stopSpeaking = () => {
  if (speakTimer) {
    clearTimeout(speakTimer);
    speakTimer = null;
  }
  if (isSpeechSupported()) {
    speechSynthesis.cancel();
  }
};

// Warm voices early when the module loads in the browser.
if (typeof window !== 'undefined') {
  primeVoices();
}
