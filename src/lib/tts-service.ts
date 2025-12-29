// TTS Service Abstraction
// Supports both browser SpeechSynthesis and Puter.js TTS

import { TTS_SERVICE, getRandomOpenAIVoice, type OpenAIVoice } from '@/config/tts';

declare global {
  interface Window {
    puter?: {
      ai: {
        txt2speech: (
          text: string,
          options: {
            provider: string;
            model: string;
            voice: string;
            response_format?: string;
            instructions?: string;
          }
        ) => Promise<{ url: string } | HTMLAudioElement>;
      };
    };
  }
}

export interface TTSService {
  speak(text: string): Promise<void>;
  cancel(): void;
}

class BrowserTTSService implements TTSService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private voiceIndex: number = 0;

  constructor() {
    this.loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(
        (voice) => voice.lang.startsWith('en') && !voice.localService
      );
      this.availableVoices = englishVoices.length > 0 ? englishVoices : voices;
    }
  }

  async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      if (this.availableVoices.length > 0) {
        const voiceIndex = this.voiceIndex % this.availableVoices.length;
        utterance.voice = this.availableVoices[voiceIndex];
        this.voiceIndex = (this.voiceIndex + 1) % this.availableVoices.length;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }

  cancel(): void {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
  }
}

class PuterTTSService implements TTSService {
  private currentAudio: HTMLAudioElement | null = null;
  private puterReady: Promise<void>;

  constructor() {
    // Wait for Puter to be available
    this.puterReady = this.waitForPuter();
  }

  private waitForPuter(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.puter && window.puter.ai) {
        console.log('[PuterTTS] Puter already loaded');
        resolve();
        return;
      }

      console.log('[PuterTTS] Waiting for Puter.js to load...');
      // Wait for script to load (max 15 seconds)
      const maxWait = 15000;
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        if (window.puter && window.puter.ai) {
          console.log('[PuterTTS] Puter.js loaded successfully');
          clearInterval(checkInterval);
          resolve();
        } else if (Date.now() - startTime > maxWait) {
          console.error('[PuterTTS] Puter.js failed to load within timeout');
          clearInterval(checkInterval);
          reject(new Error('Puter.js failed to load within timeout. Make sure the script is included in your HTML.'));
        }
      }, 100);
    });
  }

  async speak(text: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('[PuterTTS] Waiting for Puter to be ready...');
        // Wait for Puter to be ready
        await this.puterReady;
        console.log('[PuterTTS] Puter is ready');

        // Get a random voice
        const voice = getRandomOpenAIVoice();
        console.log('[PuterTTS] Using voice:', voice);

        // Call Puter TTS API
        console.log('[PuterTTS] Calling txt2speech API...');
        const result = await window.puter!.ai.txt2speech(text, {
          provider: 'openai',
          model: 'gpt-4o-mini-tts',
          voice: voice,
          response_format: 'mp3',
          instructions: 'Keep the delivery clear and friendly.',
        });

        console.log('[PuterTTS] Got result:', result);

        // Handle different return types: URL object or Audio element
        let audio: HTMLAudioElement;
        if (result instanceof HTMLAudioElement) {
          // Puter returned an Audio element directly
          console.log('[PuterTTS] Got Audio element directly');
          audio = result;
        } else if (result && typeof result === 'object' && 'url' in result) {
          // Puter returned an object with a URL
          console.log('[PuterTTS] Got audio URL:', result.url);
          audio = new Audio(result.url);
        } else {
          throw new Error('Unexpected return type from Puter TTS API');
        }

        this.currentAudio = audio;

        // Preload the audio to ensure it's ready
        audio.preload = 'auto';
        
        // Set up Media Session API for background audio support
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            artist: 'Fact Me App',
            album: 'Fact Feed',
          });

          // Set up action handlers to prevent accidental pauses
          navigator.mediaSession.setActionHandler('play', async () => {
            if (audio.paused) {
              try {
                await audio.play();
                console.log('[PuterTTS] Audio resumed via media session');
              } catch (e) {
                console.error('[PuterTTS] Failed to resume audio:', e);
              }
            }
          });

          navigator.mediaSession.setActionHandler('pause', () => {
            // Don't pause - keep playing
            console.log('[PuterTTS] Pause requested but ignored for continuous playback');
          });
        }

        // Add event listeners for debugging and recovery
        audio.onloadstart = () => console.log('[PuterTTS] Audio loading started');
        audio.oncanplay = () => console.log('[PuterTTS] Audio can play');
        audio.onplay = () => console.log('[PuterTTS] Audio playing');
        
        // Handle unexpected pauses (browser suspending audio)
        audio.onpause = () => {
          console.log('[PuterTTS] Audio paused unexpectedly');
          // Try to resume if it was paused by the browser (not user)
          if (document.visibilityState === 'hidden' || document.hidden) {
            // If page is in background, try to resume after a short delay
            setTimeout(async () => {
              if (audio.paused && this.currentAudio === audio) {
                try {
                  await audio.play();
                  console.log('[PuterTTS] Audio resumed after unexpected pause');
                } catch (e) {
                  console.error('[PuterTTS] Failed to resume after pause:', e);
                }
              }
            }, 100);
          }
        };

        // Monitor for visibility changes to keep audio playing
        const handleVisibilityChange = async () => {
          if (document.visibilityState === 'hidden' && audio.paused && this.currentAudio === audio) {
            try {
              await audio.play();
              console.log('[PuterTTS] Audio resumed after visibility change');
            } catch (e) {
              console.error('[PuterTTS] Failed to resume after visibility change:', e);
            }
          }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        audio.onended = () => {
          console.log('[PuterTTS] Audio ended');
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          this.currentAudio = null;
          resolve();
        };

        audio.onerror = (error) => {
          console.error('[PuterTTS] Audio error:', error);
          console.error('[PuterTTS] Audio error details:', {
            error: audio.error,
            networkState: audio.networkState,
            readyState: audio.readyState,
          });
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          this.currentAudio = null;
          reject(new Error(`Audio playback failed: ${audio.error?.message || 'Unknown error'}`));
        };

        // Try to play the audio
        console.log('[PuterTTS] Attempting to play audio...');
        try {
          await audio.play();
          console.log('[PuterTTS] Audio play() succeeded');
          
          // Keep audio playing even if page goes to background
          // Set up a periodic check to ensure audio is still playing
          const keepAliveInterval = setInterval(() => {
            if (this.currentAudio === audio && audio.paused && !audio.ended) {
              console.log('[PuterTTS] Audio paused, attempting to resume...');
              audio.play().catch((e) => {
                console.error('[PuterTTS] Failed to resume in keep-alive:', e);
                clearInterval(keepAliveInterval);
              });
            } else if (audio.ended || this.currentAudio !== audio) {
              clearInterval(keepAliveInterval);
            }
          }, 2000); // Check every 2 seconds

          // Clean up interval when audio ends
          audio.addEventListener('ended', () => clearInterval(keepAliveInterval), { once: true });
        } catch (playError: any) {
          console.error('[PuterTTS] Audio play() failed:', playError);
          // If autoplay is blocked, try to handle it
          if (playError.name === 'NotAllowedError') {
            reject(new Error('Audio autoplay was blocked. Please interact with the page first.'));
          } else {
            reject(playError);
          }
        }
      } catch (error) {
        console.error('[PuterTTS] Error in speak():', error);
        reject(error);
      }
    });
  }

  cancel(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }
}

// Factory function to get the appropriate TTS service
export function getTTSService(): TTSService {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    // Server-side: return a no-op service
    return {
      speak: async () => {},
      cancel: () => {},
    };
  }

  // Client-side: check environment variable (must be NEXT_PUBLIC_ prefix for client access)
  const service = (process.env.NEXT_PUBLIC_TTS_SERVICE || 'BROWSER').toUpperCase();
  console.log('[TTS] Service selected:', service);
  console.log('[TTS] Environment variable:', process.env.NEXT_PUBLIC_TTS_SERVICE);

  if (service === 'PUTER') {
    console.log('[TTS] Initializing Puter TTS service');
    return new PuterTTSService();
  }

  console.log('[TTS] Initializing Browser TTS service');
  return new BrowserTTSService();
}

