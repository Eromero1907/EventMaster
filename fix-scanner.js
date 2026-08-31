const fs = require('fs');

let code = fs.readFileSync('./src/components/QRScanner.tsx', 'utf8');

const newImports = `"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, RefreshCw } from "lucide-react";`;

const newRefs = `  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
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
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.log("Audio no soportado");
    }
  };`;

const oldStartBlock = `      await html5QrCodeRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Éxito al escanear
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          if (onScanError) onScanError(errorMessage);
        }
      );`;

const newStartBlock = `      await html5QrCodeRef.current.start(
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
      );`;

code = code.replace(/  const html5QrCodeRef = useRef<Html5Qrcode \| null>\(null\);\n  const scannerContainerId = "qr-reader-container";/, newRefs);
code = code.replace(oldStartBlock, newStartBlock);

fs.writeFileSync('./src/components/QRScanner.tsx', code);
console.log("Scanner updated with beep and debounce!");
