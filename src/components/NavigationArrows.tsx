import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface NavigationArrowsProps {
  onBack?: () => void;
  onNext?: () => void;
  showBack?: boolean;
  showNext?: boolean;
  nextLabel?: string;
  backLabel?: string;
}

const NavigationArrows: React.FC<NavigationArrowsProps> = ({
  onBack,
  onNext,
  showBack = true,
  showNext = true,
  nextLabel,
  backLabel,
}) => {
  return (
    <div
      className="fixed left-0 right-0 flex justify-between px-4 sm:px-8 z-20"
      style={{
        bottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
      }}
    >
      {showBack && onBack ? (
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="flex items-center gap-2 border-border bg-card/95 text-foreground hover:bg-muted shadow-sm transition-all duration-200 active:scale-95 min-h-[48px] min-w-[48px]"
        >
          <ChevronLeft className="h-6 w-6 shrink-0 text-foreground" strokeWidth={2.5} aria-hidden />
          <span>{backLabel ?? 'Back'}</span>
        </Button>
      ) : (
        <div />
      )}

      {showNext && onNext ? (
        <Button
          type="button"
          onClick={onNext}
          variant="outline"
          className="flex items-center gap-2 border-border bg-card/95 text-foreground hover:bg-muted shadow-sm transition-all duration-200 active:scale-95 min-h-[48px] min-w-[48px]"
        >
          <span>{nextLabel ?? 'Next'}</span>
          <ChevronRight className="h-6 w-6 shrink-0 text-foreground" strokeWidth={2.5} aria-hidden />
        </Button>
      ) : (
        <div />
      )}
    </div>
  );
};

export default NavigationArrows;
