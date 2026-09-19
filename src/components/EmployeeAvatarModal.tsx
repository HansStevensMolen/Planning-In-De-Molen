import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Mic, 
  MicOff, 
  RefreshCw, 
  Check, 
  X, 
  Trash2, 
  Upload, 
  User, 
  RotateCcw,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { Employee } from '../types';
import { saveEmployeeAvatarToCloud } from '../services/firebase';

interface EmployeeAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSaveAvatar: (employeeId: string, avatarUrl: string | null) => void;
}

export const EmployeeAvatarModal: React.FC<EmployeeAvatarModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSaveAvatar
}) => {
  // Mode: 'camera' | 'preview'
  const [mode, setMode] = useState<'camera' | 'preview'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Camera & Stream states
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [hasMicAccess, setHasMicAccess] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  
  // Countdown timer for snapshot
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Stop all active tracks and audio context
  const stopMediaStream = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (_) {}
      });
      setStream(null);
    }
    setMicVolume(0);
    setHasMicAccess(false);
  }, [stream]);

  // Start Camera with Video & Audio
  const startCamera = useCallback(async (facing: 'user' | 'environment') => {
    stopMediaStream();
    setIsInitializing(true);
    setCameraError(null);

    try {
      // First try requesting both camera and microphone
      let mediaStream: MediaStream | null = null;
      let micWorking = false;

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 640 },
            height: { ideal: 640 },
            aspectRatio: 1
          },
          audio: true
        });
        micWorking = true;
      } catch (errWithAudio) {
        console.warn('Camera with audio failed, falling back to video-only:', errWithAudio);
        // Fallback without audio if mic is unavailable or blocked
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 640 },
            height: { ideal: 640 },
            aspectRatio: 1
          },
          audio: false
        });
      }

      setStream(mediaStream);
      setHasMicAccess(micWorking);

      if (videoRef.current && mediaStream) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(e => console.warn('Video play error:', e));
      }

      // If microphone is present, set up live audio volume monitoring
      if (micWorking && mediaStream.getAudioTracks().length > 0) {
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(mediaStream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVolume = () => {
              if (analyserRef.current) {
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                  sum += dataArray[i];
                }
                const average = sum / bufferLength;
                // Scale to percentage (0 - 100)
                setMicVolume(Math.min(100, Math.round((average / 128) * 100)));
              }
              animFrameRef.current = requestAnimationFrame(updateVolume);
            };
            updateVolume();
          }
        } catch (audioErr) {
          console.warn('Could not setup audio context analyzer:', audioErr);
        }
      }

      setIsInitializing(false);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsInitializing(false);
      let errorMsg = 'Kon geen toegang krijgen tot de camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Toegang tot de camera/microfoon is geweigerd. Sta camerarechten toe in je browserinstellingen of upload een foto.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'Geen aangesloten camera gevonden. Je kunt een foto uploaden via het formulier hieronder.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'De camera is mogelijk in gebruik door een ander programma.';
      }
      setCameraError(errorMsg);
    }
  }, [stopMediaStream]);

  // Init when modal opens
  useEffect(() => {
    if (isOpen && employee) {
      setMode('camera');
      setCapturedImage(null);
      setSaveSuccessMessage(null);
      startCamera(facingMode);
    } else {
      stopMediaStream();
      setCountdown(null);
      setFlashActive(false);
    }

    return () => {
      stopMediaStream();
    };
  }, [isOpen, employee, startCamera, facingMode, stopMediaStream]);

  // Switch between front and rear cameras
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture frame from video element
  const takeSnapshot = () => {
    if (!videoRef.current) return;

    // Visual flash
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    
    // Create a 360x360 square avatar canvas
    const size = 360;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const videoWidth = video.videoWidth || 640;
      const videoHeight = video.videoHeight || 480;

      // Crop center square
      const minDim = Math.min(videoWidth, videoHeight);
      const startX = (videoWidth - minDim) / 2;
      const startY = (videoHeight - minDim) / 2;

      // If user-facing, mirror horizontally for natural mirror selfie feel
      if (facingMode === 'user') {
        ctx.translate(size, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(
        video,
        startX,
        startY,
        minDim,
        minDim,
        0,
        0,
        size,
        size
      );

      // Convert to efficient JPEG Data URL (~25KB)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      setMode('preview');
      stopMediaStream();
    }
  };

  // Start snapshot with 3-second countdown
  const startCountdownSnapshot = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle manual file upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        const size = 360;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedImage(dataUrl);
          setMode('preview');
          stopMediaStream();
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Save to Firebase and update employee
  const handleSaveToFirebase = async () => {
    if (!employee || !capturedImage) return;

    setIsSaving(true);
    try {
      // 1. Save to Firebase Firestore via dedicated cloud service
      await saveEmployeeAvatarToCloud(employee.id, capturedImage);

      // 2. Propagate to in-memory state so UI updates everywhere
      onSaveAvatar(employee.id, capturedImage);

      setSaveSuccessMessage(`Profielfoto voor ${employee.name} succesvol opgeslagen in Firebase!`);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to save avatar to Firebase:', err);
      setIsSaving(false);
      alert('Er is een fout opgetreden bij het opslaan in Firebase. Probeer het opnieuw.');
    }
  };

  // Remove photo and reset to placeholder
  const handleRemovePhoto = async () => {
    if (!employee) return;
    const confirm = window.confirm(`Weet je zeker dat je de profielfoto van ${employee.name} wilt verwijderen?`);
    if (!confirm) return;

    setIsSaving(true);
    try {
      await saveEmployeeAvatarToCloud(employee.id, null);
      onSaveAvatar(employee.id, null);
      setSaveSuccessMessage(`Profielfoto van ${employee.name} verwijderd.`);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to delete avatar from Firebase:', err);
      setIsSaving(false);
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setMode('camera');
    startCamera(facingMode);
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border-2 border-orange-200 overflow-hidden flex flex-col text-left">
        
        {/* Hidden canvas for image cropping */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs border border-white/30">
              <Camera size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide">Profielfoto Maken</h3>
              <p className="text-[11px] text-orange-100 font-medium truncate max-w-[240px]">
                {employee.name} • {employee.department === 'keuken' ? '🍳 Keuken' : '🍽️ Zaal'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition text-white cursor-pointer"
            title="Sluiten"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success Banner */}
        {saveSuccessMessage && (
          <div className="bg-emerald-500 text-white px-4 py-2.5 text-xs font-black flex items-center justify-center space-x-2 animate-in slide-in-from-top duration-150">
            <Check size={16} className="stroke-[3]" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-5 space-y-4">

          {/* Current Avatar vs New Avatar Indicator */}
          <div className="flex items-center justify-between bg-orange-50/60 p-3 rounded-2xl border border-orange-100">
            <div className="flex items-center space-x-3">
              <div 
                className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center font-black text-xs text-white uppercase shadow-sm border-2 border-white ring-2 ring-orange-200"
                style={{ backgroundColor: employee.color }}
              >
                {employee.avatarUrl ? (
                  <img src={employee.avatarUrl} alt={employee.name} className="w-full h-full object-cover" />
                ) : (
                  employee.name.split(' ').map(n => n[0]).join('')
                )}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 block">Huidige status</span>
                <span className="text-xs font-bold text-slate-700">
                  {employee.avatarUrl ? 'Profielfoto actief in Firebase' : 'Standaard avatar placeholder'}
                </span>
              </div>
            </div>

            {employee.avatarUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isSaving}
                className="text-[10px] font-black uppercase text-rose-650 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-xl border border-rose-200 transition cursor-pointer flex items-center space-x-1"
                title="Foto verwijderen en terugkeren naar initialen"
              >
                <Trash2 size={11} />
                <span>Verwijderen</span>
              </button>
            )}
          </div>

          {/* CAMERA STREAM MODE */}
          {mode === 'camera' && (
            <div className="space-y-3">
              <div className="relative w-full aspect-square bg-slate-900 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-slate-800">
                {isInitializing && (
                  <div className="absolute inset-0 z-20 bg-slate-900/90 flex flex-col items-center justify-center space-y-2 text-white">
                    <RefreshCw size={28} className="animate-spin text-orange-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">Camera initialiseren...</span>
                  </div>
                )}

                {/* Video Element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />

                {/* Flash effect */}
                {flashActive && (
                  <div className="absolute inset-0 bg-white z-30 transition-opacity duration-200 pointer-events-none" />
                )}

                {/* Circular Framing Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 rounded-full border-2 border-dashed border-white/60 shadow-[0_0_0_9999px_rgba(15,23,42,0.35)]" />
                </div>

                {/* Countdown display */}
                {countdown !== null && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                    <span className="text-7xl font-black text-white drop-shadow-lg animate-ping">
                      {countdown}
                    </span>
                  </div>
                )}

                {/* Microphone & Device Status Pill */}
                <div className="absolute top-3 left-3 z-10 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10 text-white text-[10px] font-bold">
                  {hasMicAccess ? (
                    <div className="flex items-center space-x-1.5 text-emerald-400">
                      <Mic size={11} className="animate-pulse" />
                      <span>Mic Actief</span>
                      {/* Live volume bar */}
                      <div className="w-8 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-400 transition-all duration-75"
                          style={{ width: `${Math.min(100, micVolume * 1.5)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-slate-400">
                      <MicOff size={11} />
                      <span>Alleen Video</span>
                    </div>
                  )}
                </div>

                {/* Camera Switch button if on mobile or multi-camera */}
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 shadow-md transition cursor-pointer"
                  title="Wissel tussen voor- en achtercamera"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* Camera Error Message */}
              {cameraError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 font-black text-rose-900">
                    <AlertCircle size={14} />
                    <span>Cameramelding</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{cameraError}</p>
                </div>
              )}

              {/* Action Buttons for Camera */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={takeSnapshot}
                  disabled={isInitializing || !!cameraError}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg transition duration-150 active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Camera size={16} />
                  <span>Foto Maken</span>
                </button>

                <button
                  type="button"
                  onClick={startCountdownSnapshot}
                  disabled={isInitializing || !!cameraError || countdown !== null}
                  className="px-3.5 py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-black rounded-2xl border border-amber-300 transition duration-150 active:scale-95 cursor-pointer flex items-center space-x-1"
                  title="Foto nemen na 3 seconden aftellen"
                >
                  <Clock size={14} />
                  <span>3s</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-2xl border border-slate-250 transition duration-150 active:scale-95 cursor-pointer flex items-center space-x-1"
                  title="Upload een bestaande foto"
                >
                  <Upload size={14} />
                  <span>Upload</span>
                </button>
              </div>
            </div>
          )}

          {/* PREVIEW & CONFIRM MODE */}
          {mode === 'preview' && capturedImage && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-2 space-y-3">
                <div className="relative">
                  {/* Circular Avatar Preview */}
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-orange-500 shadow-xl ring-4 ring-orange-100">
                    <img
                      src={capturedImage}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-2 rounded-full border-2 border-white shadow-md">
                    <Sparkles size={14} />
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Nieuwe Profielfoto Preview</span>
                  <p className="text-[11px] text-slate-500">
                    Klaar om direct opgeslagen te worden in Firebase Firestore voor {employee.name}.
                  </p>
                </div>
              </div>

              {/* Confirm / Retake Buttons */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveToFirebase}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg transition duration-150 active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Opslaan in Firebase...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} className="stroke-[3]" />
                      <span>Opslaan in Firebase ✓</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={isSaving}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-tight rounded-2xl border border-slate-250 transition duration-150 active:scale-95 cursor-pointer flex items-center space-x-1"
                >
                  <RotateCcw size={14} />
                  <span>Opnieuw</span>
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Info Footer */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-start space-x-2 text-[11px] text-slate-500">
            <Sparkles size={14} className="text-orange-500 shrink-0 mt-0.5" />
            <p>
              Foto's worden automatisch geoptimaliseerd voor scherpte en direct gesynchroniseerd met de Firebase cloud database van Hans en het hele team.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
