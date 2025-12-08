'use client';

import { useState, useEffect } from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StepCompletionService } from '@/lib/step-completion';

interface StepCompletionButtonProps {
  stepName: string;
  onCompletionChange?: (completed: boolean) => void;
  className?: string;
  nextStepUrl?: string;
}

export function StepCompletionButton({ 
  stepName, 
  onCompletionChange,
  className = '',
  nextStepUrl
}: StepCompletionButtonProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  // Check initial completion status
  useEffect(() => {
    const checkCompletion = async () => {
      try {
        const completed = await StepCompletionService.isStepCompleted(stepName);
        setIsCompleted(completed);
      } catch (error) {
        console.error('Error checking step completion:', error);
      }
    };

    checkCompletion();
  }, [stepName]);

  const handleComplete = async () => {
    if (isCompleted) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await StepCompletionService.completeStep(stepName);
      
      if (result.success) {
        setIsCompleted(true);
        setShowSuccess(true);
        onCompletionChange?.(true);
        
        // Navigate to next step if nextStepUrl is provided
        if (nextStepUrl) {
          setTimeout(() => {
            router.push(nextStepUrl);
          }, 1200);
        } else {
          // Hide success message after 3 seconds if no navigation
          setTimeout(() => setShowSuccess(false), 3000);
        }
      } else {
        setError(result.message);
        // Hide error after 5 seconds
        setTimeout(() => setError(null), 5000);
      }
    } catch (error) {
      console.error('Error completing step:', error);
      setError('Failed to complete step');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleComplete}
        disabled={isLoading || isCompleted}
        className={`
          inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm
          transition-all duration-300 border-2 shadow-lg hover:shadow-xl
          ${isCompleted 
            ? 'bg-green-500 border-green-500 text-white shadow-green-500/20' 
            : isLoading
              ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-blue-200/50'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-500 text-white hover:from-blue-600 hover:to-blue-700 hover:border-blue-600 shadow-blue-500/30'
          }
          ${isLoading || isCompleted ? 'cursor-default' : 'hover:scale-[1.02] active:scale-[0.98]'}
          ${className}
        `}
      >
        <div className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300
          ${isCompleted 
            ? 'bg-white border-white' 
            : isLoading
              ? 'bg-transparent border-blue-400'
              : 'bg-transparent border-white/80'
          }
        `}>
          {isLoading ? (
            <Loader2 size={12} className="text-blue-500 animate-spin" />
          ) : isCompleted ? (
            <Check size={14} className="text-green-500" />
          ) : null}
        </div>
        
        <span className="font-semibold">
          {isLoading ? 'Validating...' : isCompleted ? '✓ Completed' : 'Mark as Done'}
        </span>
        
        {nextStepUrl && !isCompleted && !isLoading && (
          <span className="text-xs opacity-75">& Next</span>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg z-10">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && isCompleted && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-green-50 border border-green-200 rounded-lg shadow-lg z-10">
          <div className="flex items-start gap-2">
            <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-green-700 text-sm font-medium">
              Step completed successfully!
              {nextStepUrl && ' Redirecting to next step...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}