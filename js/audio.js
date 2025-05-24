/**
 * Audio functionality for the AI Character Chat application
 */

import utils from './utils.js';
import dataStore from './data.js';

class AudioManager {
    constructor() {
        this.isInitialized = false;
        this.isSpeaking = false;
        this.queue = [];
        this.currentAudio = null;
        this.settings = {};
        this.speechSynthesis = window.speechSynthesis;
        this.audioContext = null;
        this.audioCache = new Map();
    }
    
    /**
     * Initialize audio manager
     */
    init() {
        if (this.isInitialized) return;
        
        try {
            // Initialize audio context on user interaction
            const initAudioContext = () => {
                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
                
                // Remove event listeners after initialization
                document.removeEventListener('click', initAudioContext);
                document.removeEventListener('touchstart', initAudioContext);
            };
            
            // Add event listeners for initialization
            document.addEventListener('click', initAudioContext);
            document.addEventListener('touchstart', initAudioContext);
            
            // Load settings
            this.settings = dataStore.settings.get();
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Error initializing audio manager:', error);
        }
    }
    
    /**
     * Update settings
     */
    updateSettings() {
        this.settings = dataStore.settings.get();
    }
    
    /**
     * Play a text-to-speech message
     * @param {string} text - Text to speak
     * @param {Object} options - TTS options
     * @returns {Promise} Promise that resolves when speech is complete
     */
    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            this.updateSettings();
            
            // Check if TTS is enabled
            if (!this.settings.textToSpeech) {
                resolve();
                return;
            }
            
            // Clean text for speech
            const cleanText = this.cleanTextForSpeech(text);
            
            // Use browser's Speech Synthesis API
            const utterance = new SpeechSynthesisUtterance(cleanText);
            
            // Set voice if available
            this.setVoice(utterance, options.voice || this.settings.ttsVoice);
            
            // Set speech properties
            utterance.rate = options.rate || this.settings.ttsRate || 1.0;
            utterance.pitch = options.pitch || 1.0;
            utterance.volume = options.volume || this.settings.ttsVolume || 1.0;
            utterance.lang = options.language || this.settings.ttsLanguage || 'en-US';
            
            // Set event handlers
            utterance.onstart = () => {
                this.isSpeaking = true;
            };
            
            utterance.onend = () => {
                this.isSpeaking = false;
                resolve();
                
                // Process next in queue
                this.processQueue();
            };
            
            utterance.onerror = (error) => {
                console.error('TTS error:', error);
                this.isSpeaking = false;
                reject(error);
                
                // Process next in queue
                this.processQueue();
            };
            
            // If already speaking, add to queue
            if (this.isSpeaking) {
                this.queue.push(utterance);
            } else {
                this.speechSynthesis.speak(utterance);
                this.currentAudio = utterance;
            }
        });
    }
    
    /**
     * Process next item in queue
     */
    processQueue() {
        if (this.queue.length > 0 && !this.isSpeaking) {
            const nextUtterance = this.queue.shift();
            this.speechSynthesis.speak(nextUtterance);
            this.currentAudio = nextUtterance;
        }
    }
    
    /**
     * Stop all speech
     */
    stop() {
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
        
        this.isSpeaking = false;
        this.queue = [];
        this.currentAudio = null;
    }
    
    /**
     * Pause speech
     */
    pause() {
        if (this.speechSynthesis && this.isSpeaking) {
            this.speechSynthesis.pause();
        }
    }
    
    /**
     * Resume speech
     */
    resume() {
        if (this.speechSynthesis && this.isSpeaking) {
            this.speechSynthesis.resume();
        }
    }
    
    /**
     * Clean text for speech
     * @param {string} text - Text to clean
     * @returns {string} Cleaned text
     */
    cleanTextForSpeech(text) {
        if (!text) return '';
        
        // Remove markdown formatting
        let cleanText = text
            .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
            .replace(/\*(.*?)\*/g, '$1')     // Italic
            .replace(/~~(.*?)~~/g, '$1')     // Strikethrough
            .replace(/```[\s\S]*?```/g, '')  // Code blocks
            .replace(/`(.*?)`/g, '$1')       // Inline code
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
            .replace(/#+ /g, '') // Headers
            .replace(/\n+/g, ' ') // Multiple newlines
            .replace(/\s+/g, ' '); // Multiple spaces
        
        // Remove emojis (optional)
        // cleanText = cleanText.replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu, '');
        
        return cleanText.trim();
    }
    
    /**
     * Set voice for utterance
     * @param {SpeechSynthesisUtterance} utterance - Utterance to set voice for
     * @param {string} voiceId - Voice ID or name
     */
    setVoice(utterance, voiceId) {
        if (!utterance || !this.speechSynthesis) return;
        
        if (voiceId === 'default') return; // Use browser default
        
        try {
            // Get available voices
            const voices = this.speechSynthesis.getVoices();
            
            if (voices.length === 0) {
                // If voices aren't loaded yet, try again after they're loaded
                this.speechSynthesis.onvoiceschanged = () => {
                    this.setVoice(utterance, voiceId);
                };
                return;
            }
            
            // Find matching voice
            let voice = voices.find(v => v.name === voiceId || v.voiceURI === voiceId);
            
            // If not found by exact match, try partial match
            if (!voice) {
                voice = voices.find(v => v.name.includes(voiceId) || v.voiceURI.includes(voiceId));
            }
            
            // Default to first English voice if not found
            if (!voice) {
                voice = voices.find(v => v.lang.startsWith('en'));
            }
            
            // Set voice if found
            if (voice) {
                utterance.voice = voice;
            }
        } catch (error) {
            console.error('Error setting voice:', error);
        }
    }
    
    /**
     * Play a notification sound
     * @param {string} type - Notification type (message, success, error, etc.)
     */
    playNotification(type = 'message') {
        this.updateSettings();
        
        // Skip if notifications are disabled
        if (!this.settings.notifications) return;
        
        // Define sounds
        const sounds = {
            message: 'data:audio/mp3;base64,SUQzAwAAAAAfdlRJVDIAAAAZAAAAaW5jb21pbmcgbWVzc2FnZSBzb3VuZP/7kGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhpbmcAAAAPAAAACwAACNAADQ0NDRoaGhoaJycnJzQ0NDRPT09PYmJiYnZ2dnZ2goKCgpiYmJilpaWlsbGxsbG+vr6+zMzMzNnZ2dnn5+fn8/Pz8/P//////wAAAABMYXZmNTguNDIuMTAAAAAAAAAAAAAAACQAAAAAAAAAAAjQlBmCRQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==',
            success: 'data:audio/mp3;base64,SUQzAwAAAAAfdlRJVDIAAAAZAAAAc3VjY2VzcyBub3RpZmljYXRpb24A/+5BkAA/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAAQTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==',
            error: 'data:audio/mp3;base64,SUQzAwAAAAAfdlRJVDIAAAAZAAAAZXJyb3Igbm90aWZpY2F0aW9uAP/7kGQAD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ=='
        };
        
        // Play sound if available
        if (sounds[type]) {
            try {
                // Check if cached
                if (!this.audioCache.has(type)) {
                    const audio = new Audio(sounds[type]);
                    this.audioCache.set(type, audio);
                }
                
                const audioElement = this.audioCache.get(type);
                audioElement.volume = this.settings.notificationVolume || 0.5;
                audioElement.play().catch(err => console.error('Error playing notification:', err));
            } catch (error) {
                console.error('Error playing notification sound:', error);
            }
        }
    }
}

// Create and export audio manager instance
const audioManager = new AudioManager();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    audioManager.init();
    
    // Setup audio-related UI elements
    const ttsToggle = utils.qs('#text-to-speech');
    if (ttsToggle) {
        // Get current setting
        const settings = dataStore.settings.get();
        ttsToggle.checked = settings.textToSpeech || false;
        
        // Update setting on change
        ttsToggle.addEventListener('change', () => {
            dataStore.settings.update({ textToSpeech: ttsToggle.checked });
            
            // Stop any ongoing speech if disabled
            if (!ttsToggle.checked) {
                audioManager.stop();
            }
        });
    }
    
    // Volume slider
    const volumeSlider = utils.qs('#tts-volume');
    if (volumeSlider) {
        // Get current setting
        const settings = dataStore.settings.get();
        volumeSlider.value = settings.ttsVolume || 0.7;
        
        // Update value display
        const volumeValue = utils.qs('#tts-volume-value');
        if (volumeValue) {
            volumeValue.textContent = volumeSlider.value;
        }
        
        // Update setting on change
        volumeSlider.addEventListener('input', () => {
            if (volumeValue) {
                volumeValue.textContent = volumeSlider.value;
            }
            
            dataStore.settings.update({ ttsVolume: parseFloat(volumeSlider.value) });
        });
    }
    
    // TTS rate slider
    const rateSlider = utils.qs('#tts-rate');
    if (rateSlider) {
        // Get current setting
        const settings = dataStore.settings.get();
        rateSlider.value = settings.ttsRate || 1.0;
        
        // Update value display
        const rateValue = utils.qs('#tts-rate-value');
        if (rateValue) {
            rateValue.textContent = rateSlider.value;
        }
        
        // Update setting on change
        rateSlider.addEventListener('input', () => {
            if (rateValue) {
                rateValue.textContent = rateSlider.value;
            }
            
            dataStore.settings.update({ ttsRate: parseFloat(rateSlider.value) });
        });
    }
    
    // Voice selector
    const voiceSelector = utils.qs('#tts-voice');
    if (voiceSelector) {
        // Populate voices
        const populateVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            
            // Clear existing options (keeping default)
            while (voiceSelector.options.length > 1) {
                voiceSelector.remove(1);
            }
            
            // Add available voices
            voices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                voiceSelector.appendChild(option);
            });
            
            // Set current selection
            const settings = dataStore.settings.get();
            if (settings.ttsVoice) {
                for (let i = 0; i < voiceSelector.options.length; i++) {
                    if (voiceSelector.options[i].value === settings.ttsVoice) {
                        voiceSelector.selectedIndex = i;
                        break;
                    }
                }
            }
        };
        
        // Get current setting
        const settings = dataStore.settings.get();
        
        // Initial population and when voices change
        populateVoices();
        window.speechSynthesis.onvoiceschanged = populateVoices;
        
        // Update setting on change
        voiceSelector.addEventListener('change', () => {
            dataStore.settings.update({ ttsVoice: voiceSelector.value });
            
            // Test voice
            const testText = "This is a test of the selected voice.";
            audioManager.speak(testText, { voice: voiceSelector.value });
        });
    }
    
    // Test TTS button
    const testTtsBtn = utils.qs('#test-tts');
    if (testTtsBtn) {
        testTtsBtn.addEventListener('click', () => {
            const testText = "Hello! This is a test of the text-to-speech system with current settings.";
            audioManager.speak(testText);
        });
    }
    
    // Stop TTS button
    const stopTtsBtn = utils.qs('#stop-tts');
    if (stopTtsBtn) {
        stopTtsBtn.addEventListener('click', () => {
            audioManager.stop();
        });
    }
});

export default audioManager;
