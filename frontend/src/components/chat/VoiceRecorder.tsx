import React, { useState, useRef, useEffect } from 'react';
import { Mic, Trash2, ChevronLeft, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceRecorderProps {
  onRecordComplete: (blob: Blob, duration: number) => void;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordComplete, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const startXRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isRecordingRef = useRef(false);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async (clientX: number) => {
    if (disabled) return;
    setPermissionError(null);
    setIsCancelled(false);
    setDragOffset(0);
    startXRef.current = clientX;
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Stop all track streams to release mic hardware
        stream.getTracks().forEach((track) => track.stop());

        if (isCancelled || dragOffset < -70) {
          // Recording cancelled by user swipe
          audioChunksRef.current = [];
          return;
        }

        const duration = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        if (audioBlob.size > 0 && duration >= 1) {
          onRecordComplete(audioBlob, duration);
        }
      };

      mediaRecorder.start(100);
      startTimeRef.current = Date.now();
      isRecordingRef.current = true;
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);

    } catch (err: any) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Microphone access was denied. Please allow microphone permission in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setPermissionError('No microphone input device was found on your device.');
      } else {
        setPermissionError('Unable to access microphone. Please check your browser audio settings.');
      }
    }
  };

  const handlePointerMove = (clientX: number) => {
    if (!isRecordingRef.current || startXRef.current === null) return;
    const deltaX = clientX - startXRef.current;
    if (deltaX < 0) {
      setDragOffset(deltaX);
      if (deltaX < -70) {
        setIsCancelled(true);
      } else {
        setIsCancelled(false);
      }
    }
  };

  const stopRecording = (cancelledManual = false) => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (cancelledManual) {
      setIsCancelled(true);
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startRecording(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handlePointerMove(e.clientX);
  };

  const handleMouseUp = () => {
    stopRecording();
  };

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      startRecording(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    stopRecording();
  };

  // Attach global mouse listeners during active desktop recording
  useEffect(() => {
    if (isRecording) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isRecording]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative flex items-center">
      {/* Microphone Button */}
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        disabled={disabled}
        title="Hold to record voice message, slide left to cancel"
        className={`p-2.5 rounded-xl transition-all cursor-pointer touch-none select-none flex items-center justify-center shrink-0 ${
          isRecording
            ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-500/40 animate-pulse'
            : 'bg-navy-800 border border-navy-700 text-slate-300 hover:text-white hover:bg-navy-700 hover:border-blue-accent/50'
        }`}
      >
        <Mic className={`w-5 h-5 ${isRecording ? 'animate-bounce' : ''}`} />
      </button>

      {/* Recording Overlay banner when active */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-20 right-4 sm:right-auto z-50 bg-navy-900/95 border border-red-500/40 shadow-2xl backdrop-blur-md px-4 py-3 rounded-2xl flex items-center gap-4 text-white text-sm"
            style={{
              transform: `translateX(${Math.min(0, dragOffset)}px)`,
            }}
          >
            {/* Pulsing Dot & Timer */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="font-mono font-bold text-red-400">
                {formatDuration(recordDuration)}
              </span>
            </div>

            {/* Slide to Cancel Indicator */}
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <ChevronLeft className="w-4 h-4 text-slate-400 animate-pulse" />
              <span className={isCancelled ? 'text-red-400 font-bold' : ''}>
                {isCancelled ? 'Release to cancel' : 'Slide left to cancel'}
              </span>
            </div>

            {/* Cancel Icon */}
            <button
              type="button"
              onClick={() => stopRecording(true)}
              className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permission Error Toast / Modal */}
      {permissionError && (
        <div className="fixed top-6 right-6 z-50 max-w-md bg-navy-900 border border-red-500/50 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Microphone Permission Error</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{permissionError}</p>
          </div>
          <button
            onClick={() => setPermissionError(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
