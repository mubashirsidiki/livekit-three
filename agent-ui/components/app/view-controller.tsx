'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'motion/react';
import { LogOut } from 'lucide-react';
import {
  useSessionContext,
  useTranscriptions,
  type Room,
} from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { AgentSessionView_01 } from '@/components/agents-ui/blocks/agent-session-view-01';
import { WelcomeView } from '@/components/app/welcome-view';
import { PostCallAnalyticsView } from '@/components/app/post-call-analytics-view';

const MotionWelcomeView = motion.create(WelcomeView);
const MotionSessionView = motion.create(AgentSessionView_01);
const MotionPostCallView = motion.create(PostCallAnalyticsView);

type ViewState = 'welcome' | 'connected' | 'post-call';

export interface TranscriptMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
}

interface CapturedCallData {
  transcript: TranscriptMessage[];
  callStartTime: number | null;
  roomName: string | null;
}

const VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.5,
    ease: 'linear',
  },
};

/**
 * Separate component so useTranscriptions fully unmounts and cleans up
 * its data stream handler when the session disconnects.
 * This prevents the "handler already set" error on reconnect.
 */
function TranscriptionCollector({
  room,
  onTranscriptsUpdate,
}: {
  room: Room;
  onTranscriptsUpdate: (transcripts: TranscriptMessage[]) => void;
}) {
  const transcriptions = useTranscriptions({ room });

  useEffect(() => {
    if (transcriptions.length > 0) {
      onTranscriptsUpdate(
        transcriptions.map((t) => ({
          id: t.streamInfo.id,
          text: t.text,
          isUser: t.participantInfo.identity === room.localParticipant.identity,
          timestamp: t.streamInfo.timestamp,
        }))
      );
    }
  }, [transcriptions, room, onTranscriptsUpdate]);

  return null;
}

interface ViewControllerProps {
  appConfig: AppConfig;
}

export function ViewController({ appConfig }: ViewControllerProps) {
  const session = useSessionContext();
  const { isConnected, start, end, room } = session;
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  const [viewState, setViewState] = useState<ViewState>('welcome');
  const [capturedData, setCapturedData] = useState<CapturedCallData>({
    transcript: [],
    callStartTime: null,
    roomName: null,
  });

  const callStartTimeRef = useRef<number | null>(null);
  const transcriptRef = useRef<TranscriptMessage[]>([]);

  const handleTranscriptsUpdate = useCallback(
    (transcripts: TranscriptMessage[]) => {
      transcriptRef.current = transcripts;
    },
    []
  );

  // Sync: when user starts a call via LiveKit, track start time and room name
  useEffect(() => {
    if (isConnected && viewState === 'welcome') {
      callStartTimeRef.current = Date.now();
      setViewState('connected');
    }
    // Save room name while connected so it's available on disconnect
    if (isConnected && room?.name) {
      setCapturedData((prev) => ({ ...prev, roomName: room.name }));
    }
  }, [isConnected, viewState, room]);

  // Detect unexpected disconnect (agent crash, network drop)
  useEffect(() => {
    if (!isConnected && viewState === 'connected') {
      const roomName = room?.name ?? capturedData.roomName;
      setCapturedData({
        transcript: [...transcriptRef.current],
        callStartTime: callStartTimeRef.current,
        roomName,
      });
      setViewState('post-call');
    }
  }, [isConnected, viewState]);

  // Intercept disconnect: capture transcript BEFORE ending session
  const handleDisconnect = useCallback(() => {
    setCapturedData({
      transcript: [...transcriptRef.current],
      callStartTime: callStartTimeRef.current,
      roomName: room?.name ?? null,
    });
    end();
    setViewState('post-call');
  }, [end]);

  // Reset to welcome screen
  const handleStartNewCall = useCallback(() => {
    transcriptRef.current = [];
    callStartTimeRef.current = null;
    setCapturedData({ transcript: [], callStartTime: null, roomName: null });
    setViewState('welcome');
  }, []);

  return (
    <>
      {/* Only mount TranscriptionCollector while connected — unmounting cleans up the handler */}
      {isConnected && room && (
        <TranscriptionCollector
          room={room}
          onTranscriptsUpdate={handleTranscriptsUpdate}
        />
      )}
      <AnimatePresence mode="wait">
        {/* Welcome view */}
        {viewState === 'welcome' && (
          <>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                router.push('/login');
              }}
              className="fixed top-4 left-4 z-50 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-3.5" />
              Logout
            </button>
            <MotionWelcomeView
              key="welcome"
              {...VIEW_MOTION_PROPS}
              startButtonText={appConfig.startButtonText}
              onStartCall={start}
            />
          </>
        )}
        {/* Session view */}
        {viewState === 'connected' && (
          <MotionSessionView
            key="session-view"
            {...VIEW_MOTION_PROPS}
            supportsChatInput={appConfig.supportsChatInput}
            supportsVideoInput={appConfig.supportsVideoInput}
            supportsScreenShare={appConfig.supportsScreenShare}
            isPreConnectBufferEnabled={appConfig.isPreConnectBufferEnabled}
            audioVisualizerType={appConfig.audioVisualizerType}
            audioVisualizerColor={
              resolvedTheme === 'dark'
                ? appConfig.audioVisualizerColorDark
                : appConfig.audioVisualizerColor
            }
            audioVisualizerColorShift={appConfig.audioVisualizerColorShift}
            audioVisualizerBarCount={appConfig.audioVisualizerBarCount}
            audioVisualizerGridRowCount={appConfig.audioVisualizerGridRowCount}
            audioVisualizerGridColumnCount={appConfig.audioVisualizerGridColumnCount}
            audioVisualizerRadialBarCount={appConfig.audioVisualizerRadialBarCount}
            audioVisualizerRadialRadius={appConfig.audioVisualizerRadialRadius}
            audioVisualizerWaveLineWidth={appConfig.audioVisualizerWaveLineWidth}
            onDisconnect={handleDisconnect}
            className="fixed inset-0"
          />
        )}
        {/* Post-call analytics */}
        {viewState === 'post-call' && (
          <MotionPostCallView
            key="post-call"
            {...VIEW_MOTION_PROPS}
            transcript={capturedData.transcript}
            callStartTime={capturedData.callStartTime}
            roomName={capturedData.roomName}
            onStartNewCall={handleStartNewCall}
          />
        )}
      </AnimatePresence>
    </>
  );
}
