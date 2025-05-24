/**
 * Settings functionality for the AI Character Chat application
 */

import utils from './utils.js';
import { t, setLanguage } from './translations.js';
import dataStore from './data.js';
import audioManager from './audio.js';

// DOM elements - General settings
const languageSelect = utils.qs('#language-select');
const swipeGestures = utils.qs('#swipe-gestures');
const animations = utils.qs('#animations');

// DOM elements - AI Model settings
const defaultModel = utils.qs('#default-model');
const temperatureSlider = utils.qs('#temperature-slider');
const temperatureValue = utils.qs('#temperature-value');
const maxTokens = utils.qs('#max-tokens');
const fallbackToggle = utils.qs('#fallback-toggle');

// DOM elements - API Keys
const openrouterKey = utils.qs('#openrouter-api-key');
const openaiKey = utils.qs('#openai-api-key');
const huggingfaceKey = utils.qs('#huggingface-api-key');
const elevenlabsKey = utils.qs('#elevenlabs-api-key');
const googleTranslateKey = utils.qs('#google-translate-api-key');
const saveOpenrouterKey = utils.qs('#save-openrouter-key');
const saveOpenaiKey = utils.qs('#save-openai-key');
const saveHuggingfaceKey = utils.qs('#save-huggingface-key');
const saveElevenlabsKey = utils.qs('#save-elevenlabs-key');
const saveGoogleTranslateKey = utils.qs('#save-google-translate-key');
const translationService = utils.qs('#translation-service');

// DOM elements - Content settings
const nsfwToggleGlobal = utils.qs('#nsfw-toggle-global');

// DOM elements - Appearance settings
const darkModeToggle = utils.qs('#dark-mode-toggle');
const fontSizeSelect = utils.qs('#font-size');
const chatBubbleStyle = utils.qs('#chat-bubble-style');
const colorThemeSelect = utils.qs('#color-theme');

// DOM elements - Audio settings
const textToSpeech = utils.qs('#text-to-speech');
const autoPlayTTS = utils.qs('#auto-play-tts');
const ttsVolume = utils.qs('#tts-volume');
const ttsVolumeValue = utils.qs('#tts-volume-value');
const ttsVoice = utils.qs('#tts-voice');
const ttsRate = utils.qs('#tts-rate');
const ttsRateValue = utils.qs('#tts-rate-value');
const testTtsBtn = utils.qs('#test-tts');
const stopTtsBtn = utils.qs('#stop-tts');

// DOM elements - Tab navigation
const tabBtns = utils.qsa('.tab-btn');

// Initialize settings page
document.addEventListener('DOMContentLoaded', () => {
    // Load current settings
    loadSettings();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup tab navigation
    setupTabNavigation();
});

/**
 * Load current settings from dataStore
 */
function loadSettings() {
    try {
        const settings = dataStore.settings.get();
        
        // General settings
        if (languageSelect) {
            languageSelect.value = settings.language || 'en';
        }
        
        if (swipeGestures) {
            swipeGestures.checked = settings.swipeGestures !== false;
        }
        
        if (animations) {
            animations.checked = settings.animations !== false;
        }
        
        // AI Model settings
        if (defaultModel) {
            defaultModel.value = settings.defaultModel || 'gpt-3.5-turbo';
        }
        
        if (temperatureSlider && temperatureValue) {
            temperatureSlider.value = settings.temperature || 0.7;
            temperatureValue.textContent = temperatureSlider.value;
        }
        
        if (maxTokens) {
            maxTokens.value = settings.maxTokens || 1000;
        }
        
        if (fallbackToggle) {
            fallbackToggle.checked = settings.enableFallback !== false;
        }
        
        // API Keys - show only if they exist (don't show raw keys)
        if (openrouterKey) {
            openrouterKey.placeholder = settings.openrouterKey ? '••••••••••••••••' : 'Enter your OpenRouter API key';
            // Default key if provided
            if (!settings.openrouterKey && "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") {
                openrouterKey.placeholder = 'Default key is already provided';
            }
        }
        
        if (openaiKey) {
            openaiKey.placeholder = settings.openaiKey ? '••••••••••••••••' : 'Enter your OpenAI API key';
            // Default key if provided
            if (!settings.openaiKey && "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") {
                openaiKey.placeholder = 'Default key is already provided';
            }
        }
        
        if (huggingfaceKey) {
            huggingfaceKey.placeholder = settings.huggingfaceKey ? '••••••••••••••••' : 'Enter your Hugging Face API key';
        }
        
        if (elevenlabsKey) {
            elevenlabsKey.placeholder = settings.elevenlabsKey ? '••••••••••••••••' : 'Enter your ElevenLabs API key';
        }
        
        if (googleTranslateKey) {
            googleTranslateKey.placeholder = settings.googleTranslateKey ? '••••••••••••••••' : 'Enter your Google Translate API key';
        }
        
        if (translationService) {
            translationService.value = settings.translationService || 'libretranslate';
        }
        
        // Content settings
        if (nsfwToggleGlobal) {
            nsfwToggleGlobal.checked = settings.nsfwContent || false;
        }
        
        // Appearance settings
        if (darkModeToggle) {
            darkModeToggle.checked = document.body.classList.contains('dark-mode');
        }
        
        if (fontSizeSelect) {
            fontSizeSelect.value = settings.fontSize || 'medium';
            // Apply font size
            applyFontSize(settings.fontSize || 'medium');
        }
        
        if (chatBubbleStyle) {
            chatBubbleStyle.value = settings.chatBubbleStyle || 'modern';
        }
        
        if (colorThemeSelect) {
            colorThemeSelect.value = settings.colorTheme || 'default';
        }
        
        // Audio settings
        if (textToSpeech) {
            textToSpeech.checked = settings.textToSpeech || false;
        }
        
        if (autoPlayTTS) {
            autoPlayTTS.checked = settings.autoPlayTTS || false;
        }
        
        if (ttsVolume && ttsVolumeValue) {
            ttsVolume.value = settings.ttsVolume || 0.7;
            ttsVolumeValue.textContent = ttsVolume.value;
        }
        
        if (ttsRate && ttsRateValue) {
            ttsRate.value = settings.ttsRate || 1.0;
            ttsRateValue.textContent = ttsRate.value;
        }
        
        // TTS voice will be handled by audio.js
    } catch (error) {
        console.error('Error loading settings:', error);
        utils.showToast('Failed to load settings', 'error');
    }
}

/**
 * Set up event listeners for the settings page
 */
function setupEventListeners() {
    // General settings
    if (languageSelect) {
        languageSelect.addEventListener('change', () => {
            setLanguage(languageSelect.value);
            saveSettings({ language: languageSelect.value });
        });
    }
    
    if (swipeGestures) {
        swipeGestures.addEventListener('change', () => {
            saveSettings({ swipeGestures: swipeGestures.checked });
        });
    }
    
    if (animations) {
        animations.addEventListener('change', () => {
            saveSettings({ animations: animations.checked });
            
            // Apply animations immediately
            if (!animations.checked) {
                document.querySelectorAll('.animate__animated').forEach(el => {
                    el.classList.remove('animate__animated');
                    el.classList.remove(
                        'animate__fadeIn',
                        'animate__fadeOut',
                        'animate__slideInUp',
                        'animate__slideOutDown',
                        'animate__bounceIn',
                        'animate__fadeInUp',
                        'animate__fadeOutDown'
                    );
                });
            }
        });
    }
    
    // AI Model settings
    if (defaultModel) {
        defaultModel.addEventListener('change', () => {
            saveSettings({ defaultModel: defaultModel.value });
        });
    }
    
    if (temperatureSlider && temperatureValue) {
        temperatureSlider.addEventListener('input', () => {
            temperatureValue.textContent = temperatureSlider.value;
            saveSettings({ temperature: parseFloat(temperatureSlider.value) });
        });
    }
    
    if (maxTokens) {
        maxTokens.addEventListener('change', () => {
            saveSettings({ maxTokens: parseInt(maxTokens.value) });
        });
    }
    
    if (fallbackToggle) {
        fallbackToggle.addEventListener('change', () => {
            saveSettings({ enableFallback: fallbackToggle.checked });
        });
    }
    
    // API Keys
    if (saveOpenrouterKey && openrouterKey) {
        saveOpenrouterKey.addEventListener('click', () => {
            const key = openrouterKey.value.trim();
            if (key) {
                saveSettings({ openrouterKey: key });
                openrouterKey.value = '';
                openrouterKey.placeholder = '••••••••••••••••';
                utils.showToast('OpenRouter API key saved', 'success');
            }
        });
    }
    
    if (saveOpenaiKey && openaiKey) {
        saveOpenaiKey.addEventListener('click', () => {
            const key = openaiKey.value.trim();
            if (key) {
                saveSettings({ openaiKey: key });
                openaiKey.value = '';
                openaiKey.placeholder = '••••••••••••••••';
                utils.showToast('OpenAI API key saved', 'success');
            }
        });
    }
    
    if (saveHuggingfaceKey && huggingfaceKey) {
        saveHuggingfaceKey.addEventListener('click', () => {
            const key = huggingfaceKey.value.trim();
            if (key) {
                saveSettings({ huggingfaceKey: key });
                huggingfaceKey.value = '';
                huggingfaceKey.placeholder = '••••••••••••••••';
                utils.showToast('Hugging Face API key saved', 'success');
            }
        });
    }
    
    if (saveElevenlabsKey && elevenlabsKey) {
        saveElevenlabsKey.addEventListener('click', () => {
            const key = elevenlabsKey.value.trim();
            if (key) {
                saveSettings({ elevenlabsKey: key });
                elevenlabsKey.value = '';
                elevenlabsKey.placeholder = '••••••••••••••••';
                utils.showToast('ElevenLabs API key saved', 'success');
            }
        });
    }
    
    if (saveGoogleTranslateKey && googleTranslateKey) {
        saveGoogleTranslateKey.addEventListener('click', () => {
            const key = googleTranslateKey.value.trim();
            if (key) {
                saveSettings({ googleTranslateKey: key });
                googleTranslateKey.value = '';
                googleTranslateKey.placeholder = '••••••••••••••••';
                utils.showToast('Google Translate API key saved', 'success');
            }
        });
    }
    
    if (translationService) {
        translationService.addEventListener('change', () => {
            saveSettings({ translationService: translationService.value });
        });
    }
    
    // Content settings
    if (nsfwToggleGlobal) {
        nsfwToggleGlobal.addEventListener('change', () => {
            saveSettings({ nsfwContent: nsfwToggleGlobal.checked });
        });
    }
    
    // Appearance settings
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            utils.toggleDarkMode(darkModeToggle.checked);
        });
    }
    
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', () => {
            saveSettings({ fontSize: fontSizeSelect.value });
            applyFontSize(fontSizeSelect.value);
        });
    }
    
    if (chatBubbleStyle) {
        chatBubbleStyle.addEventListener('change', () => {
            saveSettings({ chatBubbleStyle: chatBubbleStyle.value });
        });
    }
    
    if (colorThemeSelect) {
        colorThemeSelect.addEventListener('change', () => {
            saveSettings({ colorTheme: colorThemeSelect.value });
            applyColorTheme(colorThemeSelect.value);
        });
    }
    
    // Audio settings
    if (textToSpeech) {
        textToSpeech.addEventListener('change', () => {
            saveSettings({ textToSpeech: textToSpeech.checked });
            
            // Enable/disable related settings
            if (autoPlayTTS) {
                autoPlayTTS.disabled = !textToSpeech.checked;
            }
            
            if (ttsVolume) {
                ttsVolume.disabled = !textToSpeech.checked;
            }
            
            if (ttsRate) {
                ttsRate.disabled = !textToSpeech.checked;
            }
            
            if (ttsVoice) {
                ttsVoice.disabled = !textToSpeech.checked;
            }
            
            if (testTtsBtn) {
                testTtsBtn.disabled = !textToSpeech.checked;
            }
            
            if (stopTtsBtn) {
                stopTtsBtn.disabled = !textToSpeech.checked;
            }
        });
    }
    
    if (autoPlayTTS) {
        autoPlayTTS.addEventListener('change', () => {
            saveSettings({ autoPlayTTS: autoPlayTTS.checked });
        });
    }
    
    if (ttsVolume && ttsVolumeValue) {
        ttsVolume.addEventListener('input', () => {
            ttsVolumeValue.textContent = ttsVolume.value;
            saveSettings({ ttsVolume: parseFloat(ttsVolume.value) });
        });
    }
    
    if (ttsRate && ttsRateValue) {
        ttsRate.addEventListener('input', () => {
            ttsRateValue.textContent = ttsRate.value;
            saveSettings({ ttsRate: parseFloat(ttsRate.value) });
        });
    }
    
    // Help button
    const helpBtn = utils.qs('#settings-help-btn');
    if (helpBtn) {
        helpBtn.addEventListener('click', showHelpModal);
    }
}

/**
 * Save settings to dataStore
 * @param {Object} updatedSettings - Settings to update
 */
async function saveSettings(updatedSettings) {
    try {
        await dataStore.settings.update(updatedSettings);
    } catch (error) {
        console.error('Error saving settings:', error);
        utils.showToast('Failed to save settings', 'error');
    }
}

/**
 * Set up tab navigation
 */
function setupTabNavigation() {
    if (tabBtns.length === 0) return;
    
    tabBtns.forEach(tab => {
        tab.addEventListener('click', () => {
            // Get the target tab
            const targetTab = tab.dataset.tab;
            
            // Remove active class from all tabs and sections
            tabBtns.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            
            document.querySelectorAll('.settings-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Add active class to clicked tab and its corresponding section
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            
            const targetSection = document.querySelector(`#${targetTab}`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

/**
 * Apply font size
 * @param {string} size - Font size (small, medium, large)
 */
function applyFontSize(size) {
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${size}`);
}

/**
 * Apply color theme
 * @param {string} theme - Color theme
 */
function applyColorTheme(theme) {
    document.body.classList.remove('theme-default', 'theme-blue', 'theme-green', 'theme-purple', 'theme-dark');
    
    if (theme !== 'default') {
        document.body.classList.add(`theme-${theme}`);
    }
}

/**
 * Show settings help modal
 */
function showHelpModal() {
    const helpContent = `
        <h3>Settings Help</h3>
        <h4>General</h4>
        <p><strong>Language:</strong> Change the application language.</p>
        <p><strong>Swipe Gestures:</strong> Enable/disable swipe gestures for chat items.</p>
        <p><strong>Animations:</strong> Enable/disable UI animations.</p>
        
        <h4>AI Model Settings</h4>
        <p><strong>Model:</strong> Select the AI model to use for character responses.</p>
        <p><strong>Temperature:</strong> Controls randomness of responses. Higher values make output more random.</p>
        <p><strong>Max Response Length:</strong> Sets the maximum length of AI responses.</p>
        <p><strong>Model Fallback:</strong> Enables fallback to simpler models if the selected model is unavailable.</p>
        
        <h4>API Keys</h4>
        <p>Enter your API keys for different services. Keys are stored securely on your device.</p>
        
        <h4>Content</h4>
        <p><strong>NSFW Content:</strong> Toggle visibility of mature content in character gallery.</p>
        
        <h4>Appearance</h4>
        <p><strong>Dark Mode:</strong> Toggle dark/light mode.</p>
        <p><strong>Font Size:</strong> Adjust text size throughout the app.</p>
        <p><strong>Chat Bubble Style:</strong> Change the appearance of chat messages.</p>
        
        <h4>Audio</h4>
        <p><strong>Text to Speech:</strong> Enable AI responses to be read aloud.</p>
        <p><strong>Auto Play:</strong> Automatically play TTS for new messages.</p>
        <p><strong>Voice:</strong> Select the voice for TTS.</p>
    `;
    
    utils.showConfirmDialog(
        helpContent,
        null,
        null,
        'Close',
        '',
        'Settings Help'
    );
}
