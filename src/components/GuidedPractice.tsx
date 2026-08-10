import React, { useMemo, useState } from 'react';
import { Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReadAloudButton from '@/components/ReadAloudButton';

interface GuidedPracticeProps {
  lessonType: 'counting' | 'addition' | 'subtraction';
  num1: number;
  num2?: number;
  onClose: () => void;
}

/**
 * Interactive remediation overlay shown after a wrong answer.
 * The student manipulates pencils themselves instead of watching an animation:
 * - counting: tap empty outlines to fill them while counting up
 * - addition: tap to add the second group one pencil at a time
 * - subtraction: tap pencils to take them away, then count what's left
 */
const GuidedPractice: React.FC<GuidedPracticeProps> = ({
  lessonType,
  num1,
  num2 = 0,
  onClose,
}) => {
  const [filled, setFilled] = useState<boolean[]>(
    Array(lessonType === 'addition' ? num2 : num1).fill(false)
  );
  const [crossed, setCrossed] = useState<boolean[]>(Array(num1).fill(false));

  const filledCount = filled.filter(Boolean).length;
  const crossedCount = crossed.filter(Boolean).length;

  const instruction = useMemo(() => {
    if (lessonType === 'counting') {
      return `Let's count together! Tap each empty pencil to fill it. We need ${num1} pencils.`;
    }
    if (lessonType === 'addition') {
      return `Let's add together! We start with ${num1} pencils. Tap to add ${num2} more, one at a time.`;
    }
    return `Let's subtract together! We have ${num1} pencils. Tap ${num2} pencils to take them away.`;
  }, [lessonType, num1, num2]);

  const isDone =
    lessonType === 'counting'
      ? filledCount === num1
      : lessonType === 'addition'
      ? filledCount === num2
      : crossedCount === num2;

  const fillSlot = (index: number) => {
    if (filled[index]) return;
    setFilled(prev => prev.map((f, i) => (i === index ? true : f)));
  };

  const crossPencil = (index: number) => {
    if (crossed[index] || crossedCount >= num2) return;
    setCrossed(prev => prev.map((c, i) => (i === index ? true : c)));
  };

  const pencilSlot = (isFilled: boolean, index: number, colorClass: string) => (
    <button
      key={index}
      type="button"
      onClick={() => fillSlot(index)}
      disabled={isFilled}
      aria-label={isFilled ? `Pencil ${index + 1}` : 'Empty pencil - tap to fill'}
      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isFilled
          ? 'bg-primary/10 scale-100'
          : 'border-2 border-dashed border-muted-foreground/50 hover:border-primary hover:scale-110 active:scale-95 cursor-pointer'
      }`}
    >
      {isFilled ? (
        <Pencil className={`w-8 h-8 ${colorClass} animate-count-pop`} />
      ) : (
        <Pencil className="w-8 h-8 text-muted-foreground/30" />
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-background/90 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card rounded-2xl p-6 md:p-8 border border-border max-w-lg w-full text-center relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-10 h-10 min-h-[44px] min-w-[44px] rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex items-start justify-center gap-3 mb-6">
          <p className="text-lg font-semibold text-foreground text-left flex-1">
            {instruction}
          </p>
          <ReadAloudButton text={instruction} className="shrink-0" />
        </div>

        {lessonType === 'counting' && (
          <>
            <div className="flex gap-3 flex-wrap justify-center mb-6">
              {filled.map((isFilled, i) => pencilSlot(isFilled, i, 'text-primary'))}
            </div>
            <p className="text-3xl font-bold text-primary mb-6" aria-live="polite">
              {filledCount} {filledCount === 1 ? 'pencil' : 'pencils'}
            </p>
          </>
        )}

        {lessonType === 'addition' && (
          <>
            <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
              <div className="flex gap-2 flex-wrap justify-center">
                {Array.from({ length: num1 }).map((_, i) => (
                  <Pencil key={i} className="w-8 h-8 text-primary" />
                ))}
              </div>
              <span className="text-2xl font-bold text-primary">+</span>
              <div className="flex gap-2 flex-wrap justify-center">
                {filled.map((isFilled, i) => pencilSlot(isFilled, i, 'text-accent'))}
              </div>
            </div>
            <p className="text-3xl font-bold text-primary mb-6" aria-live="polite">
              {num1} + {filledCount}{isDone ? ` = ${num1 + num2}` : ''}
            </p>
          </>
        )}

        {lessonType === 'subtraction' && (
          <>
            <div className="flex gap-3 flex-wrap justify-center mb-6">
              {crossed.map((isCrossed, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => crossPencil(i)}
                  disabled={isCrossed || crossedCount >= num2}
                  aria-label={isCrossed ? 'Taken away' : 'Tap to take away'}
                  className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isCrossed
                      ? 'opacity-40 scale-90'
                      : crossedCount >= num2
                      ? ''
                      : 'hover:bg-destructive/10 hover:scale-110 active:scale-95 cursor-pointer'
                  }`}
                >
                  <Pencil className={`w-8 h-8 ${isCrossed ? 'text-muted-foreground' : 'text-primary'}`} />
                  {isCrossed && (
                    <span className="absolute inset-0 flex items-center justify-center text-destructive text-3xl font-bold">
                      ✕
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-3xl font-bold text-primary mb-6" aria-live="polite">
              {crossedCount < num2
                ? `Took away ${crossedCount} of ${num2}`
                : `${num1} − ${num2} = ${num1 - num2}`}
            </p>
          </>
        )}

        {isDone && (
          <div className="animate-fade-in">
            <p className="text-lg font-semibold text-success mb-4 flex items-center justify-center gap-2">
              <Check className="w-6 h-6" />
              You did it! Now try the question again.
            </p>
            <Button onClick={onClose} size="lg">
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidedPractice;
