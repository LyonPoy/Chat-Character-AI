/**
 * Chat functionality for the AI Character Chat application
 */

import utils from './utils.js';
import { t } from './translations.js';
import auth from './auth.js';
import dataStore from './data.js';
import { showOverlay, hideOverlay, closeAllModals } from './navigation.js';

// DOM Elements
let chatMessages;
let messageInput;
let sendMessageBtn;
let characterInfo;
let characterAvatar;
let characterName;
let typingIndicator;
let thinkingIndicator;
let backBtn;
let chatDate;
let chatMenuBtn;
let chatOptionsMenu;
let currentCharacter;
let currentChat;

// Templates
let outgoingMessageTemplate;
let incomingMessageTemplate;
let systemMessageTemplate;

// State
let isProcessing = false;
let isMuted = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize dataStore
    if (!dataStore.initialized) {
        await dataStore.init();
    }
    
    // Cache DOM elements
    chatMessages = utils.qs('#chat-messages');
    messageInput = utils.qs('#message-input');
    sendMessageBtn = utils.qs('#send-message-btn');
    characterInfo = utils.qs('#character-info');
    characterAvatar = utils.qs('#character-avatar');
    characterName = utils.qs('#character-name');
    typingIndicator = utils.qs('#typing-indicator');
    thinkingIndicator = utils.qs('#thinking-indicator');
    backBtn = utils.qs('#back-btn');
    chatDate = utils.qs('#chat-date');
    chatMenuBtn = utils.qs('#chat-menu-btn');
    chatOptionsMenu = utils.qs('#chat-options-menu');
    
    // Cache templates
    outgoingMessageTemplate = utils.qs('#outgoing-message-template');
    incomingMessageTemplate = utils.qs('#incoming-message-template');
    systemMessageTemplate = utils.qs('#system-message-template');
    
    // Get chat ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const chatId = urlParams.get('id');
    
    if (chatId) {
        // Load chat
        await loadChat(chatId);
        
        // Setup event listeners
        setupEventListeners();
        
        // Scroll to bottom
        scrollToBottom();
    } else {
        // No chat ID, redirect to index
        window.location.href = 'index.html';
    }
});

/**
 * Load chat data
 * @param {string} chatId - Chat ID to load
 */
async function loadChat(chatId) {
    try {
        utils.showLoading(true);
        
        // Get chat data
        currentChat = dataStore.getChat(chatId);
        
        if (!currentChat) {
            utils.showToast('Chat not found', 'error');
            window.location.href = 'index.html';
            return;
        }
        
        // Get character data
        currentCharacter = dataStore.getCharacter(currentChat.characterId);
        
        if (!currentCharacter) {
            utils.showToast('Character not found', 'error');
            window.location.href = 'index.html';
            return;
        }
        
        // Update chat header
        updateChatHeader();
        
        // Render messages
        renderMessages();
        
        // Mark chat as read
        await dataStore.markChatAsRead(chatId);
        
        utils.showLoading(false);
    } catch (error) {
        console.error('Error loading chat:', error);
        utils.showToast('Error loading chat', 'error');
        utils.showLoading(false);
    }
}

/**
 * Update chat header with character information
 */
function updateChatHeader() {
    if (characterAvatar) {
        characterAvatar.src = currentCharacter.avatarUrl || utils.generateAvatar(currentCharacter.name);
        characterAvatar.alt = currentCharacter.name;
    }
    
    if (characterName) {
        characterName.textContent = currentCharacter.name;
    }
    
    if (chatDate) {
        // Set chat date to today
        chatDate.textContent = new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

/**
 * Render chat messages
 */
function renderMessages() {
    if (!chatMessages || !currentChat) return;
    
    // Clear messages container
    chatMessages.innerHTML = '';
    
    // Group messages by date
    const groupedMessages = groupMessagesByDate();
    
    // Render each date group
    Object.keys(groupedMessages).forEach(date => {
        // Add date divider
        const dateDivider = document.createElement('div');
        dateDivider.className = 'date-divider';
        dateDivider.innerHTML = `<span>${date}</span>`;
        chatMessages.appendChild(dateDivider);
        
        // Render messages for this date
        groupedMessages[date].forEach(message => {
            renderMessage(message);
        });
    });
}

/**
 * Group messages by date
 * @returns {Object} - Object with dates as keys and arrays of messages as values
 */
function groupMessagesByDate() {
    const grouped = {};
    
    if (!currentChat || !currentChat.messages) {
        return grouped;
    }
    
    currentChat.messages.forEach(message => {
        const date = new Date(message.timestamp).toLocaleDateString();
        
        if (!grouped[date]) {
            grouped[date] = [];
        }
        
        grouped[date].push(message);
    });
    
    return grouped;
}

/**
 * Render a single message
 * @param {Object} message - Message object
 */
function renderMessage(message) {
    if (!chatMessages) return;
    
    let messageElement;
    
    if (message.sender === 'user') {
        // Outgoing message (from user)
        messageElement = renderOutgoingMessage(message);
    } else if (message.sender === 'character') {
        // Incoming message (from character)
        messageElement = renderIncomingMessage(message);
    } else if (message.sender === 'system') {
        // System message
        messageElement = renderSystemMessage(message);
    }
    
    if (messageElement) {
        chatMessages.appendChild(messageElement);
    }
}

/**
 * Render outgoing message (from user)
 * @param {Object} message - Message object
 * @returns {HTMLElement} - Message element
 */
function renderOutgoingMessage(message) {
    if (!outgoingMessageTemplate) return null;
    
    const element = document.importNode(outgoingMessageTemplate.content, true);
    const messageContent = element.querySelector('.message-content');
    const messageTime = element.querySelector('.message-time');
    
    if (messageContent) {
        messageContent.innerHTML = formatMessageContent(message.content);
    }
    
    if (messageTime) {
        messageTime.textContent = formatMessageTime(message.timestamp);
    }
    
    return element;
}

/**
 * Render incoming message (from character)
 * @param {Object} message - Message object
 * @returns {HTMLElement} - Message element
 */
function renderIncomingMessage(message) {
    if (!incomingMessageTemplate) return null;
    
    const element = document.importNode(incomingMessageTemplate.content, true);
    const messageContent = element.querySelector('.message-content');
    const messageTime = element.querySelector('.message-time');
    const avatar = element.querySelector('.avatar img');
    
    if (messageContent) {
        messageContent.innerHTML = formatMessageContent(message.content);
    }
    
    if (messageTime) {
        messageTime.textContent = formatMessageTime(message.timestamp);
    }
    
    if (avatar && currentCharacter) {
        avatar.src = currentCharacter.avatarUrl || utils.generateAvatar(currentCharacter.name);
        avatar.alt = currentCharacter.name;
    }
    
    return element;
}

/**
 * Render system message
 * @param {Object} message - Message object
 * @returns {HTMLElement} - Message element
 */
function renderSystemMessage(message) {
    if (!systemMessageTemplate) return null;
    
    const element = document.importNode(systemMessageTemplate.content, true);
    const messageContent = element.querySelector('.system-message-content');
    
    if (messageContent) {
        messageContent.innerHTML = formatMessageContent(message.content);
    }
    
    return element;
}

/**
 * Format message content with simple markdown-like formatting
 * @param {string} content - Raw message content
 * @returns {string} - Formatted HTML content
 */
function formatMessageContent(content) {
    if (!content) return '';
    
    // Replace URLs with links
    content = content.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    // Replace **bold** with <strong>
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace *italic* with <em>
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Replace newlines with <br>
    content = content.replace(/\n/g, '<br>');
    
    return content;
}

/**
 * Format message timestamp into readable time
 * @param {string} timestamp - Message timestamp
 * @returns {string} - Formatted time string
 */
function formatMessageTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Scroll chat to bottom
 */
function scrollToBottom() {
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

/**
 * Setup scroll detection
 */
function setupScrollDetection() {
    if (!chatMessages) return;
    
    chatMessages.addEventListener('scroll', utils.throttle(() => {
        const isAtBottom = chatMessages.scrollHeight - chatMessages.scrollTop <= chatMessages.clientHeight + 100;
        const scrollToBottomBtn = utils.qs('#scroll-to-bottom');
        
        if (scrollToBottomBtn) {
            if (isAtBottom) {
                scrollToBottomBtn.classList.add('hidden');
            } else {
                scrollToBottomBtn.classList.remove('hidden');
            }
        }
    }, 100));
}

/**
 * Set up event listeners for the chat page
 */
function setupEventListeners() {
    // Send message on button click
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }
    
    // Send message on Enter key (but allow Shift+Enter for new line)
    if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Auto-resize textarea
        messageInput.addEventListener('input', () => {
            messageInput.style.height = 'auto';
            messageInput.style.height = `${messageInput.scrollHeight}px`;
        });
    }
    
    // Chat menu
    if (chatMenuBtn && chatOptionsMenu) {
        chatMenuBtn.addEventListener('click', () => {
            chatOptionsMenu.classList.toggle('hidden');
            
            if (!chatOptionsMenu.classList.contains('hidden')) {
                showOverlay();
            } else {
                hideOverlay();
            }
        });
    }
    
    // Chat menu items
    const viewCharacterInfoBtn = utils.qs('#view-character-info');
    const chatSettingsBtn = utils.qs('#chat-settings');
    const clearConversationBtn = utils.qs('#clear-conversation');
    const exportChatBtn = utils.qs('#export-chat');
    const selectMessagesBtn = utils.qs('#select-messages');
    const closeChatMenuBtn = utils.qs('#close-chat-menu');
    
    if (viewCharacterInfoBtn) {
        viewCharacterInfoBtn.addEventListener('click', () => {
            if (chatOptionsMenu) chatOptionsMenu.classList.add('hidden');
            toggleCharacterInfo();
        });
    }
    
    if (chatSettingsBtn) {
        chatSettingsBtn.addEventListener('click', () => {
            if (chatOptionsMenu) chatOptionsMenu.classList.add('hidden');
            
            const chatSettingsModal = utils.qs('#chat-settings-modal');
            if (chatSettingsModal) {
                chatSettingsModal.classList.remove('hidden');
                showOverlay();
            }
        });
    }
    
    if (clearConversationBtn) {
        clearConversationBtn.addEventListener('click', () => {
            if (chatOptionsMenu) chatOptionsMenu.classList.add('hidden');
            confirmClearChat();
        });
    }
    
    if (exportChatBtn) {
        exportChatBtn.addEventListener('click', () => {
            if (chatOptionsMenu) chatOptionsMenu.classList.add('hidden');
            
            const exportChatModal = utils.qs('#export-chat-modal');
            if (exportChatModal) {
                exportChatModal.classList.remove('hidden');
                showOverlay();
            }
        });
    }
    
    if (selectMessagesBtn) {
        selectMessagesBtn.addEventListener('click', () => {
            if (chatOptionsMenu) chatOptionsMenu.classList.add('hidden');
            utils.showToast('Message selection coming soon', 'info');
        });
    }
    
    if (closeChatMenuBtn) {
        closeChatMenuBtn.addEventListener('click', () => {
            if (chatOptionsMenu) chatOptionsMenu.classList.add('hidden');
            hideOverlay();
        });
    }
    
    // Voice input button
    const voiceInputBtn = utils.qs('#voice-input-btn');
    if (voiceInputBtn) {
        voiceInputBtn.addEventListener('click', toggleVoiceRecording);
    }
    
    // Call button
    const callBtn = utils.qs('#call-btn');
    if (callBtn) {
        callBtn.addEventListener('click', () => {
            const callModal = utils.qs('#call-modal');
            const callAvatar = utils.qs('#call-avatar');
            
            if (callModal && callAvatar && currentCharacter) {
                callAvatar.src = currentCharacter.avatarUrl || utils.generateAvatar(currentCharacter.name);
                callAvatar.alt = currentCharacter.name;
                
                callModal.classList.remove('hidden');
                showOverlay();
                
                // Simulate call connecting and then ending after 5 seconds
                setTimeout(() => {
                    const callStatus = utils.qs('#call-status');
                    if (callStatus) {
                        callStatus.textContent = 'Connected';
                    }
                    
                    // End call after 5 more seconds
                    setTimeout(() => {
                        if (callModal) {
                            callModal.classList.add('hidden');
                            hideOverlay();
                        }
                    }, 5000);
                }, 2000);
            }
        });
    }
    
    // End call button
    const endCallBtn = utils.qs('#end-call');
    if (endCallBtn) {
        endCallBtn.addEventListener('click', () => {
            const callModal = utils.qs('#call-modal');
            if (callModal) {
                callModal.classList.add('hidden');
                hideOverlay();
            }
        });
    }
    
    // Emoji button
    const emojiBtn = utils.qs('#emoji-btn');
    if (emojiBtn) {
        emojiBtn.addEventListener('click', () => {
            const emojiPicker = utils.qs('#emoji-picker');
            if (emojiPicker) {
                emojiPicker.classList.toggle('hidden');
                
                if (!emojiPicker.classList.contains('hidden')) {
                    // Initialize emoji grid if empty
                    const emojiGrid = utils.qs('#emoji-grid');
                    if (emojiGrid && !emojiGrid.children.length) {
                        // Add some sample emojis
                        const emojis = [
                            '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', 
                            '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗', 
                            '😙', '😚', '🙂', '🤗', '🤩', '🤔', '🤨', '😐', 
                            '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐'
                        ];
                        
                        emojis.forEach(emoji => {
                            const emojiBtn = document.createElement('button');
                            emojiBtn.className = 'emoji-btn';
                            emojiBtn.textContent = emoji;
                            emojiBtn.addEventListener('click', () => {
                                if (messageInput) {
                                    messageInput.value += emoji;
                                    emojiPicker.classList.add('hidden');
                                    messageInput.focus();
                                }
                            });
                            
                            emojiGrid.appendChild(emojiBtn);
                        });
                    }
                }
            }
        });
    }
    
    // Close emoji picker
    const closeEmojiPickerBtn = utils.qs('#close-emoji-picker');
    if (closeEmojiPickerBtn) {
        closeEmojiPickerBtn.addEventListener('click', () => {
            const emojiPicker = utils.qs('#emoji-picker');
            if (emojiPicker) {
                emojiPicker.classList.add('hidden');
            }
        });
    }
    
    // Attach file button
    const attachBtn = utils.qs('#attach-btn');
    if (attachBtn) {
        attachBtn.addEventListener('click', () => {
            utils.showToast('File attachment coming soon', 'info');
        });
    }
    
    // Setup modals close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.classList.add('hidden');
                hideOverlay();
            }
        });
    });
    
    // Overlay click to close modals
    const overlay = utils.qs('#overlay');
    if (overlay) {
        overlay.addEventListener('click', () => {
            closeAllModals();
        });
    }
    
    // Setup scroll detection
    setupScrollDetection();
}

/**
 * Send a message
 */
async function sendMessage() {
    if (!messageInput || !currentChat || isProcessing) return;
    
    const content = messageInput.value.trim();
    
    if (!content) return;
    
    try {
        isProcessing = true;
        
        // Clear input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        
        // Create message object
        const message = {
            sender: 'user',
            content,
            timestamp: new Date().toISOString()
        };
        
        // Add message to chat
        await dataStore.addMessage(currentChat.id, message);
        
        // Reload chat data
        currentChat = dataStore.getChat(currentChat.id);
        
        // Render all messages (this ensures proper ordering)
        renderMessages();
        
        // Show typing indicator
        showTypingIndicator();
        
        // Scroll to bottom
        scrollToBottom();
    } catch (error) {
        console.error('Error sending message:', error);
        utils.showToast('Error sending message', 'error');
    } finally {
        isProcessing = false;
    }
}

/**
 * Toggle character info panel
 */
function toggleCharacterInfo() {
    const characterInfoModal = utils.qs('#character-info-modal');
    
    if (!characterInfoModal || !currentCharacter) return;
    
    // Populate character info
    const infoAvatar = utils.qs('#info-avatar');
    const infoName = utils.qs('#info-name');
    const infoCreator = utils.qs('#info-creator');
    const infoDescription = utils.qs('#info-description');
    const infoPersonality = utils.qs('#info-personality');
    const infoTags = utils.qs('#info-tags');
    
    if (infoAvatar) {
        infoAvatar.src = currentCharacter.avatarUrl || utils.generateAvatar(currentCharacter.name);
        infoAvatar.alt = currentCharacter.name;
    }
    
    if (infoName) {
        infoName.textContent = currentCharacter.name;
    }
    
    if (infoCreator) {
        infoCreator.textContent = currentCharacter.creator === 'system' ? 'Official Character' : 'Custom Character';
    }
    
    if (infoDescription) {
        infoDescription.textContent = currentCharacter.fullDescription || currentCharacter.description || 'No description available.';
    }
    
    if (infoPersonality) {
        infoPersonality.textContent = currentCharacter.personality || 'No personality information available.';
    }
    
    if (infoTags && currentCharacter.tags) {
        infoTags.innerHTML = '';
        
        currentCharacter.tags.forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'character-tag';
            tagEl.textContent = tag;
            infoTags.appendChild(tagEl);
        });
    }
    
    // Show modal
    characterInfoModal.classList.remove('hidden');
    showOverlay();
}

/**
 * Toggle mute state
 */
function toggleMute() {
    isMuted = !isMuted;
    
    const muteButton = utils.qs('#mute-btn');
    if (muteButton) {
        const icon = muteButton.querySelector('i');
        
        if (icon) {
            if (isMuted) {
                icon.classList.remove('fa-volume-up');
                icon.classList.add('fa-volume-mute');
            } else {
                icon.classList.remove('fa-volume-mute');
                icon.classList.add('fa-volume-up');
            }
        }
    }
    
    utils.showToast(isMuted ? 'Sound muted' : 'Sound unmuted', 'info');
}

/**
 * Confirm clearing chat
 */
function confirmClearChat() {
    const clearChatModal = utils.qs('#clear-chat-modal');
    
    if (!clearChatModal) return;
    
    clearChatModal.classList.remove('hidden');
    showOverlay();
    
    const confirmClearChatBtn = utils.qs('#confirm-clear-chat');
    const cancelClearChatBtn = utils.qs('#cancel-clear-chat');
    
    if (confirmClearChatBtn) {
        confirmClearChatBtn.onclick = async () => {
            await clearChat();
            clearChatModal.classList.add('hidden');
            hideOverlay();
        };
    }
    
    if (cancelClearChatBtn) {
        cancelClearChatBtn.onclick = () => {
            clearChatModal.classList.add('hidden');
            hideOverlay();
        };
    }
}

/**
 * Clear chat
 */
async function clearChat() {
    if (!currentChat) return;
    
    try {
        utils.showLoading(true);
        
        // Get greeting message from character
        const greeting = currentCharacter.greeting || `Hello! I'm ${currentCharacter.name}. How can I help you today?`;
        
        // Create initial message
        const initialMessage = {
            sender: 'character',
            content: greeting,
            timestamp: new Date().toISOString()
        };
        
        // Update chat with only initial message
        await dataStore.updateChat(currentChat.id, {
            messages: [initialMessage]
        });
        
        // Reload chat data
        currentChat = dataStore.getChat(currentChat.id);
        
        // Render messages
        renderMessages();
        
        // Show success message
        utils.showToast('Chat cleared', 'success');
        
        utils.showLoading(false);
    } catch (error) {
        console.error('Error clearing chat:', error);
        utils.showToast('Error clearing chat', 'error');
        utils.showLoading(false);
    }
}

/**
 * Toggle voice recording
 */
function toggleVoiceRecording() {
    const voiceRecordingUI = utils.qs('#voice-recording-ui');
    
    if (!voiceRecordingUI) return;
    
    if (voiceRecordingUI.classList.contains('hidden')) {
        startRecording();
    } else {
        stopRecording();
    }
}

/**
 * Start voice recording
 */
async function startRecording() {
    const voiceRecordingUI = utils.qs('#voice-recording-ui');
    const recordingTime = utils.qs('#recording-time');
    
    if (!voiceRecordingUI || !recordingTime) return;
    
    try {
        // Show recording UI
        voiceRecordingUI.classList.remove('hidden');
        
        // In a real app, we would start recording here
        // For now, we'll just simulate it
        
        // Start timer
        let seconds = 0;
        voiceRecordingUI.timer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            recordingTime.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }, 1000);
    } catch (error) {
        console.error('Error starting recording:', error);
        utils.showToast('Error starting voice recording', 'error');
        voiceRecordingUI.classList.add('hidden');
    }
}

/**
 * Stop voice recording
 */
function stopRecording() {
    const voiceRecordingUI = utils.qs('#voice-recording-ui');
    
    if (!voiceRecordingUI) return;
    
    // Clear timer
    if (voiceRecordingUI.timer) {
        clearInterval(voiceRecordingUI.timer);
    }
    
    // Hide recording UI
    voiceRecordingUI.classList.add('hidden');
    
    // In a real app, we would stop recording and process the audio here
    // For this mock implementation, we'll just add a dummy message
    
    const dummyTranscript = 'This is a simulated voice message';
    
    if (messageInput) {
        messageInput.value = dummyTranscript;
        sendMessage();
    }
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    if (!typingIndicator) return;
    
    typingIndicator.classList.remove('hidden');
    
    // Hide typing indicator after a delay
    setTimeout(() => {
        typingIndicator.classList.add('hidden');
    }, 2000);
}

/**
 * Show or hide thinking indicator
 * @param {boolean} show - Whether to show the indicator
 */
function showThinkingIndicator(show) {
    if (!thinkingIndicator) return;
    
    if (show) {
        const thinkingAvatarImg = utils.qs('#thinking-avatar-img');
        
        if (thinkingAvatarImg && currentCharacter) {
            thinkingAvatarImg.src = currentCharacter.avatarUrl || utils.generateAvatar(currentCharacter.name);
            thinkingAvatarImg.alt = currentCharacter.name;
        }
        
        thinkingIndicator.classList.remove('hidden');
    } else {
        thinkingIndicator.classList.add('hidden');
    }
}

export {
    loadChat,
    updateChatHeader,
    renderMessages,
    groupMessagesByDate,
    renderMessage,
    formatMessageContent,
    formatMessageTime,
    scrollToBottom,
    setupScrollDetection,
    setupEventListeners,
    sendMessage,
    toggleCharacterInfo,
    toggleMute,
    confirmClearChat,
    clearChat,
    toggleVoiceRecording,
    startRecording,
    stopRecording,
    showTypingIndicator,
    showThinkingIndicator
};