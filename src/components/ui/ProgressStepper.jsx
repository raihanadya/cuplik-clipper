import React from 'react';
import { Check, LoaderCircle, AlertCircle, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { PIPELINE_STAGES } from '../../constants/pipelineStages.js';

export function ProgressStepper({
  stagesDetail = {},
  currentStage,
  className,
}) {
  return (
    <div className={clsx('w-full', className)}>
      <ol className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-2">
        {PIPELINE_STAGES.map((stage, index) => {
          const status = stagesDetail[stage.key] || 'pending';
          const isDone = status === 'done';
          const isProcessing = status === 'processing' || currentStage === stage.key;
          const isFailed = status === 'failed';
          const isPending = status === 'pending' && !isProcessing;

          return (
            <li
              key={stage.key}
              aria-current={isProcessing ? 'step' : undefined}
              className={clsx(
                'relative flex flex-col p-4 rounded-xl border transition-all duration-300',
                isDone && 'bg-[#3F7D55]/10 border-[#3F7D55]/30 text-[#3F7D55]',
                isProcessing && 'bg-[#A86F24]/10 border-[#A86F24]/40 text-[#A86F24] ring-1 ring-[#A86F24]/30 shadow-xs',
                isFailed && 'bg-[#B54A43]/10 border-[#B54A43]/40 text-[#B54A43]',
                isPending && 'bg-[#FCFBF8] border-[#DEDAD2] text-[#969189]'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold',
                    isDone && 'bg-[#3F7D55] text-white',
                    isProcessing && 'bg-[#A86F24] text-white animate-pulse',
                    isFailed && 'bg-[#B54A43] text-white',
                    isPending && 'bg-[#F7F5F0] text-[#969189] border border-[#DEDAD2]'
                  )}
                >
                  {isDone ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : isProcessing ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : isFailed ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={clsx(
                        'text-xs font-bold uppercase tracking-wider',
                        isDone && 'text-[#3F7D55]',
                        isProcessing && 'text-[#A86F24]',
                        isFailed && 'text-[#B54A43]',
                        isPending && 'text-[#6F6B63]'
                      )}
                    >
                      {stage.label}
                    </h4>
                    <span
                      className={clsx(
                        'text-[10px] font-medium uppercase px-2 py-0.5 rounded-full',
                        isDone && 'bg-[#3F7D55]/20 text-[#3F7D55]',
                        isProcessing && 'bg-[#A86F24]/20 text-[#A86F24] animate-pulse',
                        isFailed && 'bg-[#B54A43]/20 text-[#B54A43]',
                        isPending && 'bg-[#F7F5F0] text-[#969189]'
                      )}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-2 text-xs text-[#6F6B63] line-clamp-2 leading-relaxed">
                {stage.description}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default ProgressStepper;
