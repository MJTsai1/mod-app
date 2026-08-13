"use client";

const STEP_LABELS = ["Basics", "Activity", "Experience", "Scenarios", "Motivation"];

export function ProgressBar({ currentStep }: { currentStep: number }) {
  const totalSteps = STEP_LABELS.length;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--color-text)]">
          Step {currentStep + 1} of {totalSteps}: {STEP_LABELS[currentStep]}
        </span>
        <span className="text-sm text-[var(--color-text-subtle)]">
          {Math.round(((currentStep + 1) / totalSteps) * 100)}%
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-elevated)]"
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label="Application progress"
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${((currentStep + 1) / totalSteps) * 100}%`,
            background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-soft))",
          }}
        />
      </div>
      <ol className="mt-4 hidden justify-between sm:flex">
        {STEP_LABELS.map((label, index) => (
          <li
            key={label}
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{
              color:
                index <= currentStep ? "var(--color-accent-soft)" : "var(--color-text-subtle)",
            }}
            aria-current={index === currentStep ? "step" : undefined}
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full border text-[10px]"
              style={{
                borderColor:
                  index <= currentStep ? "var(--color-accent)" : "var(--color-border-strong)",
                background: index < currentStep ? "var(--color-accent)" : "transparent",
                color: index < currentStep ? "white" : undefined,
              }}
            >
              {index < currentStep ? "✓" : index + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>
    </div>
  );
}
