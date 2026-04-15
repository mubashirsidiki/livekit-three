import { Button } from '@/components/ui/button';

function WelcomeImage() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mb-4 size-16"
    >
      {/* Scales of Justice icon */}
      <rect x="30" y="12" width="4" height="36" rx="1" fill="currentColor" />
      <rect x="22" y="48" width="20" height="4" rx="2" fill="currentColor" />
      <rect x="26" y="44" width="12" height="4" rx="1" fill="currentColor" />
      <rect x="12" y="10" width="40" height="4" rx="2" fill="currentColor" />
      <circle cx="32" cy="9" r="5" fill="currentColor" />
      <circle cx="32" cy="9" r="3" fill="var(--background, #ffffff)" />
      <line x1="14" y1="14" x2="14" y2="28" stroke="currentColor" strokeWidth="2" />
      <path d="M6 28 L22 28 L19 36 L9 36 Z" fill="currentColor" />
      <line x1="50" y1="14" x2="50" y2="24" stroke="currentColor" strokeWidth="2" />
      <path d="M42 24 L58 24 L55 32 L45 32 Z" fill="currentColor" />
    </svg>
  );
}

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref}>
      <section className="bg-background flex flex-col items-center justify-center text-center">
        <WelcomeImage />

        <p className="text-foreground max-w-prose pt-1 leading-6 font-medium">
          Connect with our AI legal intake assistant
        </p>

        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Experience a demo of AI-powered legal intake for Sterling & Associates Law Firm
        </p>

        <Button
          size="lg"
          onClick={onStartCall}
          className="mt-6 w-64 rounded-full font-mono text-xs font-bold tracking-wider uppercase"
        >
          {startButtonText}
        </Button>

        {process.env.NEXT_PUBLIC_FIRM_PHONE && (
          <p className="text-muted-foreground mt-4 text-sm">
            or call us anytime at{' '}
            <a
              href={`tel:${process.env.NEXT_PUBLIC_FIRM_PHONE}`}
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              {process.env.NEXT_PUBLIC_FIRM_PHONE}
            </a>
          </p>
        )}
      </section>

      <div className="fixed bottom-5 left-0 flex w-full items-center justify-center">
        <p className="text-muted-foreground max-w-prose pt-1 text-xs leading-5 font-normal text-pretty md:text-sm">
          Sterling & Associates — AI-Powered Legal Intake Demo
        </p>
      </div>
    </div>
  );
};
