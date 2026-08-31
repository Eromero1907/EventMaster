"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, RefreshCw } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<{ text: string; time: number }>({ text: "", time: 0 });
  const scannerContainerId = "qr-reader-container";

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz (A5)
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      if (navigator.vibrate) navigator.vibrate(100); // Vibración de 100ms
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.log("Audio no soportado");
    }
  };

  useEffect(() => {
    // Obtener lista de cámaras disponibles
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Preferir cámara trasera si existe (común en celulares)
          const backCamera = devices.find((d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("trasera") ||
            d.label.toLowerCase().includes("environment")
          );
          setSelectedCamera(backCamera ? backCamera.id : devices[0].id);
        } else {
          setErrorMsg("No se detectaron cámaras en este dispositivo.");
        }
      })
      .catch((err) => {
        console.error("Error al obtener cámaras:", err);
        setErrorMsg("Permiso de cámara no concedido o no disponible.");
      });

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    if (!selectedCamera) return;
    setErrorMsg(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      await html5QrCodeRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          const now = Date.now();
          // Prevenir escaneos múltiples del mismo código (Debounce de 3 segundos)
          if (lastScanRef.current.text === decodedText && now - lastScanRef.current.time < 3000) {
            return;
          }
          lastScanRef.current = { text: decodedText, time: now };
          
          playBeep();
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          if (onScanError) onScanError(errorMessage);
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.error("Error al iniciar cámara:", err);
      setErrorMsg("No se pudo iniciar la cámara. Verifica los permisos del navegador.");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Error al detener cámara:", err);
      }
    }
  };

  return (
    <div className="bg-white border border-sand rounded-2xl p-5 text-navy shadow-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-sienna" />
          <h3 className="font-semibold text-base">Escáner QR de Entrada</h3>
        </div>

        {cameras.length > 1 && (
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            disabled={isScanning}
            className="bg-white border border-sand rounded-lg px-3 py-1.5 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {cameras.map((cam) => (
              <option key={cam.id} value={cam.id}>
                {cam.label || `Cámara ${cam.id}`}
              </option>
            ))}
          </select>
        )}
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-4 text-center">
          {errorMsg}
        </div>
      )}

      {/* Contenedor del video */}
      <div className="relative overflow-hidden rounded-xl bg-cream border border-sand flex items-center justify-center min-h-[280px]">
        <div id={scannerContainerId} className="w-full h-full max-w-md mx-auto" />
        
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-cream/90 text-steel p-6 text-center">
            <CameraOff className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slateblue">Cámara pausada</p>
            <p className="text-xs text-steel mt-1 max-w-xs">
              Haz clic en "Iniciar Escaneo" para activar la cámara y escanear los códigos QR de los boletos.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center">
        {!isScanning ? (
          <button
            onClick={startScanner}
            disabled={cameras.length === 0}
            className="bg-terra text-white hover:bg-sienna text-white disabled:opacity-50 text-navy font-medium px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-terra/30 flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Iniciar Escaneo en Vivo
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="bg-red-600 hover:bg-red-500 text-navy font-medium px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-red-600/30 flex items-center gap-2"
          >
            <CameraOff className="w-4 h-4" />
            Pausar Escaneo
          </button>
        )}
      </div>
    </div>
  );
}
