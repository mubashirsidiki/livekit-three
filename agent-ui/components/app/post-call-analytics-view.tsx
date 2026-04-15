'use client';

import {
  Clock,
  MessageCircle,
  User,
  Bot,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TranscriptMessage } from '@/components/app/view-controller';

interface PostCallAnalyticsViewProps {
  transcript: TranscriptMessage[];
  callStartTime: number | null;
  roomName: string | null;
  onStartNewCall: () => void;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${remainingSeconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
}

export function PostCallAnalyticsView({
  transcript,
  callStartTime,
  onStartNewCall,
}: PostCallAnalyticsViewProps) {
  const userMessages = transcript.filter((m) => m.isUser);
  const agentMessages = transcript.filter((m) => !m.isUser);
  const callDuration = callStartTime != null ? Date.now() - callStartTime : 0;

  return (
    <div className="flex h-full w-full flex-col items-center overflow-y-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
          <MessageCircle className="size-6 text-foreground" />
        </div>
        <h2 className="text-foreground text-xl font-semibold">Call Summary</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Sterling & Associates — Legal Intake
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid w-full max-w-lg grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Clock className="text-muted-foreground mx-auto mb-1 size-5" />
          <p className="text-foreground text-lg font-semibold">
            {callStartTime != null ? formatDuration(callDuration) : '—'}
          </p>
          <p className="text-muted-foreground text-xs">Duration</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <User className="text-muted-foreground mx-auto mb-1 size-5" />
          <p className="text-foreground text-lg font-semibold">{userMessages.length}</p>
          <p className="text-muted-foreground text-xs">Your Messages</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Bot className="text-muted-foreground mx-auto mb-1 size-5" />
          <p className="text-foreground text-lg font-semibold">{agentMessages.length}</p>
          <p className="text-muted-foreground text-xs">Agent Messages</p>
        </div>
      </div>

      {/* Transcript */}
      <div className="mb-8 w-full max-w-lg">
        <h3 className="text-foreground mb-3 text-sm font-semibold uppercase tracking-wider">
          Transcript
        </h3>
        {transcript.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">No conversation recorded.</p>
        ) : (
          <div className="max-h-80 space-y-3 overflow-y-auto rounded-xl border border-border bg-card p-4">
            {transcript.map((msg) => {
              const time = new Date(msg.timestamp);
              const timeStr = time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={msg.id} className="flex gap-3">
                  <div
                    className={`mt-1 flex size-6 shrink-0 items-center justify-center rounded-full ${msg.isUser ? 'bg-primary/10' : 'bg-muted'}`}
                  >
                    {msg.isUser ? (
                      <User className="size-3 text-primary" />
                    ) : (
                      <Bot className="size-3 text-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-foreground text-xs font-medium">
                        {msg.isUser ? 'You' : 'Agent'}
                      </span>
                      <span className="text-muted-foreground text-[10px]">{timeStr}</span>
                    </div>
                    <p className="text-foreground text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Call Button */}
      <Button
        size="lg"
        onClick={onStartNewCall}
        className="w-64 rounded-full font-mono text-xs font-bold tracking-wider uppercase"
      >
        Start New Call
        <ArrowRight className="ml-2 size-4" />
      </Button>

      <div className="mt-auto pt-6">
        <p className="text-muted-foreground text-xs">
          Sterling & Associates — AI-Powered Legal Intake
        </p>
      </div>
    </div>
  );
}
