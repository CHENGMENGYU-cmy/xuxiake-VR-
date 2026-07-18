'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecorded: (blob: Blob) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onRecorded, onCancel, disabled }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const MAX_DURATION = 60; // 最长60秒

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        audioCtx.close();
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      mediaRecorder.start(100);
      setRecording(true);
      startTimeRef.current = Date.now();

      // 计时器
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
        if (elapsed >= MAX_DURATION) {
          stopRecording();
        }
      }, 200);

      // 波形采样
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const sampleWaveform = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((s, v) => s + v, 0) / bufferLength;
        const normalized = Math.min(1, avg / 128);
        setWaveform((prev) => {
          const next = [...prev, normalized];
          return next.length > 40 ? next.slice(-40) : next;
        });
        animFrameRef.current = requestAnimationFrame(sampleWaveform);
      };
      sampleWaveform();
    } catch {
      onCancel();
    }
  }, [onCancel]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      // 等待onstop后处理
      recorder.addEventListener('stop', () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size > 0) onRecorded(blob);
      }, { once: true });
    }
    setRecording(false);
  }, [onRecorded]);

  const handleCancel = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    setRecording(false);
    setDuration(0);
    setWaveform([]);
    onCancel();
  }, [onCancel]);

  useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [startRecording]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-1 items-center gap-3">
      {/* 取消按钮 */}
      <button
        onClick={handleCancel}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
      >
        <X className="h-4 w-4" />
      </button>

      {/* 录音状态 + 波形 */}
      <div className="flex flex-1 items-center gap-2 rounded-full bg-red-50 px-4 py-2 dark:bg-red-950/30">
        <div className={cn('h-2.5 w-2.5 rounded-full bg-red-500', recording && 'animate-pulse')} />
        <span className="text-sm font-medium text-red-600 dark:text-red-400">
          {formatDuration(duration)}
        </span>

        {/* 波形可视化 */}
        <div className="flex flex-1 items-center gap-[2px] overflow-hidden">
          {waveform.map((v, i) => (
            <div
              key={i}
              className="w-[3px] shrink-0 rounded-full bg-red-400/60 transition-all"
              style={{ height: `${Math.max(4, v * 24)}px` }}
            />
          ))}
          {waveform.length === 0 && (
            <div className="h-1 w-full rounded-full bg-red-200 dark:bg-red-800" />
          )}
        </div>

        <span className="text-xs text-red-400">{MAX_DURATION - duration}s</span>
      </div>

      {/* 发送按钮（松开停止录音） */}
      <button
        onClick={stopRecording}
        disabled={disabled || duration < 1}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        <Mic className="h-5 w-5" />
      </button>
    </div>
  );
}
