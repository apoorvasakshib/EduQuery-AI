import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Square } from 'lucide-react';

export function VoiceInputButton({ onSpeechRecorded, isListening, setIsListening }) {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSupported(true);
    }
  }, []);

  const toggleListen = () => {
    if (!supported) {
      alert('Speech recognition is not supported in this browser window. Please use Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onSpeechRecorded(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <button
      type="button"
      onClick={toggleListen}
      className={`p-2.5 rounded-md transition-all flex items-center justify-center ${
        isListening
          ? 'bg-rose-600 text-white animate-pulse shadow-md ring-2 ring-rose-400'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950 hover:text-sky-700'
      }`}
      title={isListening ? 'Listening... Click to stop' : 'Click microphone to speak question'}
    >
      {isListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
    </button>
  );
}

export function VoiceReaderButton({ text }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown symbols from text before speaking
    const cleanedText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      className={`p-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
        isSpeaking
          ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
          : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800'
      }`}
      title={isSpeaking ? 'Stop listening' : 'Listen to AI audio response'}
    >
      {isSpeaking ? (
        <>
          <Square className="w-3.5 h-3.5 text-rose-600" /> Stop Audio
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5" /> Listen
        </>
      )}
    </button>
  );
}
