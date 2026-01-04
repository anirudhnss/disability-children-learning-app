
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraProps {
  onCapture: (base64Image: string) => void;
  isActive: boolean;
}

export const Camera: React.FC<CameraProps> = ({ onCapture, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      // First try environment (back) camera
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: false 
        });
      } catch (e) {
        // Fallback to any available camera (like front cam on laptops)
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false 
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err: any) {
      console.error("Camera Access Error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Camera permission was denied. Please allow camera access in your browser settings to continue!");
      } else {
        setError("Could not start camera. Please make sure no other app is using it!");
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isActive, startCamera, stopCamera]);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        onCapture(dataUrl);
      }
    }
  };

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-800 p-8 text-center rounded-[40px] border-4 border-dashed border-slate-300">
        <div className="text-6xl mb-4">📸</div>
        <h3 className="text-xl font-black mb-2">Camera Oopsie!</h3>
        <p className="text-sm font-bold text-slate-500 mb-6">{error}</p>
        <button 
          onClick={startCamera}
          className="bg-indigo-600 text-white px-8 py-3 rounded-full font-black shadow-lg active:scale-95 transition-all"
        >
          TRY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-[40px] overflow-hidden shadow-2xl bg-black border-4 border-white">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button 
          onClick={captureFrame}
          className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full border-4 border-white shadow-2xl flex items-center justify-center active:scale-90 transition-transform group"
        >
          <div className="w-18 h-18 bg-white rounded-full flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <div className="w-8 h-8 bg-indigo-500 rounded-full animate-pulse"></div>
          </div>
        </button>
      </div>
    </div>
  );
};
