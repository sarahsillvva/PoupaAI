import React, { useState, useLayoutEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface TourStep {
  selector: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [styles, setStyles] = useState({
    tooltip: { visibility: 'hidden', opacity: 0 } as React.CSSProperties,
    arrow: {} as React.CSSProperties,
    arrowClasses: '',
  });

  const currentStep = steps[currentStepIndex];

  // Effect 1: Find the target element and get its dimensions
  useLayoutEffect(() => {
    setTargetRect(null); // Hide highlight and tooltip during transition
    const targetElement = document.querySelector(currentStep.selector);

    if (targetElement) {
      // Aligning to the top of the viewport ('start') is more stable than 'nearest' or 'center' for this layout,
      // preventing the unpredictable reflow that was causing incorrect coordinate calculations.
      targetElement.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'nearest' });

      const updateRect = () => {
        setTargetRect(targetElement.getBoundingClientRect());
      };
      
      // The delay remains critical. It allows the browser's rendering engine to catch up
      // with the synchronous scroll command and report the correct, final position of the element.
      const timerId = setTimeout(updateRect, 100);

      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect, true); // Use capture to get scroll events early

      return () => {
        clearTimeout(timerId);
        window.removeEventListener('resize', updateRect);
        window.removeEventListener('scroll', updateRect, true);
      };
    } else {
      handleNext(); // Skip if element not found
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex, currentStep.selector]);

  // Effect 2: Calculate tooltip and arrow positions once we have targetRect and the tooltip is rendered
  useLayoutEffect(() => {
    if (!targetRect || !tooltipRef.current) {
      setStyles(s => ({ ...s, tooltip: { ...s.tooltip, visibility: 'hidden', opacity: 0 } }));
      return;
    }

    const tooltipEl = tooltipRef.current;
    const { offsetWidth: tooltipWidth, offsetHeight: tooltipHeight } = tooltipEl;
    const { innerWidth: winWidth, innerHeight: winHeight } = window;
    const space = 15; // Offset from target and screen edges

    const position = currentStep.position || 'bottom';

    let top = 0, left = 0;
    let arrowClasses = '';

    // Set initial positions and arrow classes based on desired placement
    switch (position) {
      case 'top':
        top = targetRect.top - tooltipHeight - space;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        arrowClasses = 'absolute -translate-x-1/2 bottom-[-8px] w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white dark:border-t-gray-800';
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - space;
        arrowClasses = 'absolute -translate-y-1/2 right-[-8px] w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white dark:border-l-gray-800';
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + space;
        arrowClasses = 'absolute -translate-y-1/2 left-[-8px] w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white dark:border-r-gray-800';
        break;
      default: // 'bottom'
        top = targetRect.bottom + space;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        arrowClasses = 'absolute -translate-x-1/2 top-[-8px] w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white dark:border-b-gray-800';
        break;
    }

    // --- Boundary Checks ---
    if (left < space) left = space;
    if (left + tooltipWidth > winWidth - space) {
      left = winWidth - tooltipWidth - space;
    }
    if (top < space) top = space;
    if (top + tooltipHeight > winHeight - space) {
      top = winHeight - tooltipHeight - space;
    }

    // --- Arrow Position Correction ---
    let arrowStyle: React.CSSProperties = {};
    if (position === 'top' || position === 'bottom') {
      const targetCenterX = targetRect.left + targetRect.width / 2;
      arrowStyle.left = `${targetCenterX - left}px`;
    } else { // 'left' or 'right'
      const targetCenterY = targetRect.top + targetRect.height / 2;
      arrowStyle.top = `${targetCenterY - top}px`;
    }

    setStyles({
      tooltip: {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 10001,
        transition: 'top 0.3s ease, left 0.3s ease, opacity 0.3s ease',
        visibility: 'visible',
        opacity: 1,
      },
      arrow: arrowStyle,
      arrowClasses: arrowClasses,
    });
  }, [targetRect, currentStep.position]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <>
      <div 
        className="fixed inset-0 h-screen w-screen z-[9999]"
        onClick={handleSkip}
      />
      
      {targetRect && (
        <div
          className="fixed pointer-events-none transition-all duration-300 ease-in-out"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            borderRadius: '6px',
            zIndex: 10000,
          }}
        />
      )}

      <div
        ref={tooltipRef}
        style={styles.tooltip}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 w-72"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
      >
        <div style={styles.arrow} className={styles.arrowClasses} />
        <div className="flex justify-between items-center mb-2">
            <h3 id="tour-title" className="text-lg font-bold text-gray-900 dark:text-white">{currentStep?.title}</h3>
            <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Encerrar tour"
            >
                <X size={20} />
            </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {currentStep?.content}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">{`${currentStepIndex + 1} de ${steps.length}`}</span>
          <div>
             <button
              onClick={handleSkip}
              className="text-sm text-gray-600 dark:text-gray-400 hover:underline mr-4"
            >
              Pular tour
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700"
            >
              {currentStepIndex === steps.length - 1 ? 'Finalizar' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;