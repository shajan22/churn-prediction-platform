import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  key: string;
  title: string;
  description: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: string;
  onStepClick: (step: any) => void;
}

const ProgressStepper: React.FC<ProgressStepperProps> = ({ steps, currentStep, onStepClick }) => {
  const currentIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className="w-full bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = step.key === currentStep;
          const isClickable = index <= currentIndex;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isClickable && onStepClick(step.key)}
                  disabled={!isClickable}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-all duration-200 mb-2
                    ${isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                        : isClickable
                          ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          : 'bg-gray-100 text-gray-400'
                    }
                    ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>
                <div className="text-center">
                  <div className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-600'}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 max-w-20">
                    {step.description}
                  </div>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-4 
                  ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressStepper;