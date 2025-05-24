/**
 * Main functionality for the AI Character Chat index page
 */

import utils from './utils.js';
import { t } from './translations.js';
import auth from './auth.js';
import dataStore from './data.js';

// DOM elements
let chatList;
let emptyState;
let searchInput;
let clearSearch;

// State
let chats = [];
let filteredChats = [];
let searchQuery = '';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Make sure auth is checked before proceeding
    if (!auth.isSignedIn()) {
        return;
    }
    
    // Cache DOM elements
    chatList = utils.qs('#chat-list');
    emptyState = utils.qs('#empty-state');
    searchInput = utils.qs('#search-input');
    clearSearch = utils.qs('#clear-search');
    
    // Initialize
    await initialize();
    
    // Setup event listeners
    setupEventListeners();
});

/**
 * Initialize the page
 */
async function initialize() {
    try {
        utils.showLoading(true);
        
        // Ensure data store is initialized
        if (!dataStore.initialized) {
            await dataStore.init();
        }
        
        // Load chats
        chats = dataStore.getChats();
        filteredChats = [...chats];
        
        // Render chats
        renderChatList();
        
        utils.showLoading(false);
    } catch (error) {
        console.error('Error initializing index page:', error);
        utils.showToast('Error loading chats', 'error');
        utils.showLoading(false);
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Clear search
    if (clearSearch) {
        clearSearch.addEventListener('click', clearSearchQuery);
    }
    
    // New chat menu item
    const newChat = utils.qs('#new-chat');
    if (newChat) {
        newChat.addEventListener('click', () => {
            window.location.href = 'character.html';
        });
    }
}

/**
 * Handle search input
 */
function handleSearch() {
    searchQuery = searchInput.value.trim().toLowerCase();
    
    // Show/hide clear button
    if (searchQuery) {
        clearSearch.classList.remove('hidden');
    } else {
        clearSearch.classList.add('hidden');
    }
    
    // Filter chats
    filterChats();
    
    // Render filtered chats
    renderChatList();
}

/**
 * Clear search query
 */
function clearSearchQuery() {
    searchInput.value = '';
    searchQuery = '';
    clearSearch.classList.add('hidden');
    
    // Reset filtered chats
    filteredChats = [...chats];
    
    // Render chats
    renderChatList();
}

/**
 * Filter chats based on search query
 */
function filterChats() {
    if (!searchQuery) {
        filteredChats = [...chats];
        return;
    }
    
    filteredChats = chats.filter(chat => {
        const character = dataStore.getCharacter(chat.characterId);
        const characterName = character ? character.name.toLowerCase() : '';
        
        // Search by character name
        if (characterName.includes(searchQuery)) {
            return true;
        }
        
        // Search in messages
        if (chat.messages && chat.messages.length > 0) {
            return chat.messages.some(msg => 
                msg.content.toLowerCase().includes(searchQuery)
            );
        }
        
        return false;
    });
}

/**
 * Render the chat list
 */
function renderChatList() {
    if (!chatList) return;
    
    // Sort chats by updated time (newest first)
    const sortedChats = [...filteredChats].sort((a, b) => {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    
    // Clear list
    chatList.innerHTML = '';
    
    // Show empty state if no chats
    if (sortedChats.length === 0) {
        showEmptyState();
        return;
    }
    
    // Hide empty state
    hideEmptyState();
    
    // Render each chat
    sortedChats.forEach(chat => {
        const chatItem = createChatItem(chat);
        chatList.appendChild(chatItem);
    });
}

/**
 * Create a chat list item
 * @param {Object} chat - Chat data
 * @returns {HTMLElement} Chat item element
 */
function createChatItem(chat) {
    // Get character
    const character = dataStore.getCharacter(chat.characterId);
    
    // Get last message
    const lastMessage = chat.messages && chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1]
        : null;
    
    // Create chat item
    const chatItem = utils.createElement('li', {
        className: 'chat-item',
        dataset: {
            id: chat.id
        }
    });
    
    // Create chat link
    const chatLink = utils.createElement('a', {
        className: 'chat-link',
        href: `chat.html?id=${chat.id}`
    });
    
    // Create avatar
    const avatar = utils.createElement('div', {
        className: 'avatar'
    }, [
        utils.createElement('img', {
            src: character ? character.avatarUrl : utils.generateAvatar('Unknown'),
            alt: character ? character.name : 'Unknown Character'
        })
    ]);
    
    // Create chat details
    const chatDetails = utils.createElement('div', {
        className: 'chat-details'
    });
    
    // Create top line (name and time)
    const chatTopLine = utils.createElement('div', {
        className: 'chat-top-line'
    }, [
        utils.createElement('h3', {
            className: 'chat-name'
        }, character ? character.name : 'Unknown Character'),
        utils.createElement('span', {
            className: 'chat-time'
        }, chat.updatedAt ? utils.formatDate(chat.updatedAt, true) : '')
    ]);
    
    // Create bottom line (preview and indicators)
    const chatBottomLine = utils.createElement('div', {
        className: 'chat-bottom-line'
    });
    
    // Create message preview
    const messagePreview = utils.createElement('p', {
        className: 'chat-preview'
    }, lastMessage ? utils.truncateText(lastMessage.content, 60) : 'Start a conversation');
    
    // Create indicators
    const chatIndicators = utils.createElement('div', {
        className: 'chat-indicators'
    });
    
    // Add message status if needed
    if (lastMessage && lastMessage.sender === 'user') {
        const messageStatus = utils.createElement('span', {
            className: 'message-status delivered'
        }, [
            utils.createElement('i', {
                className: 'fas fa-check'
            })
        ]);
        
        chatIndicators.appendChild(messageStatus);
    }
    
    // Add unread message count if needed
    if (chat.unread) {
        const messageCount = utils.createElement('span', {
            className: 'message-count'
        }, '1');
        
        chatIndicators.appendChild(messageCount);
    }
    
    // Assemble the chat item
    chatBottomLine.appendChild(messagePreview);
    chatBottomLine.appendChild(chatIndicators);
    
    chatDetails.appendChild(chatTopLine);
    chatDetails.appendChild(chatBottomLine);
    
    chatLink.appendChild(avatar);
    chatLink.appendChild(chatDetails);
    
    chatItem.appendChild(chatLink);
    
    // Add swipe buttons (delete and archive)
    const archiveBtn = utils.createElement('button', {
        className: 'chat-swipe-btn archive-btn',
        'aria-label': 'Archive chat'
    }, [
        utils.createElement('i', {
            className: 'fas fa-archive'
        })
    ]);
    
    const deleteBtn = utils.createElement('button', {
        className: 'chat-swipe-btn delete-btn',
        'aria-label': 'Delete chat'
    }, [
        utils.createElement('i', {
            className: 'fas fa-trash'
        })
    ]);
    
    // Add event listeners for swipe buttons
    archiveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        archiveChat(chat.id);
    });
    
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        confirmDeleteChat(chat.id);
    });
    
    chatItem.appendChild(archiveBtn);
    chatItem.appendChild(deleteBtn);
    
    // Setup swipe functionality
    setupSwipeActions(chatItem);
    
    return chatItem;
}

/**
 * Setup swipe actions for a chat item
 * @param {HTMLElement} chatItem - Chat item element
 */
function setupSwipeActions(chatItem) {
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;
    
    // Touch events
    chatItem.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isSwiping = true;
    });
    
    chatItem.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        
        currentX = e.touches[0].clientX;
        const diffX = currentX - startX;
        
        // Only allow swiping left
        if (diffX < 0) {
            // Limit swipe to -150px
            const translateX = Math.max(diffX, -150);
            chatItem.style.transform = `translateX(${translateX}px)`;
        }
    });
    
    chatItem.addEventListener('touchend', () => {
        isSwiping = false;
        
        const diffX = currentX - startX;
        
        // If swiped more than 75px, show action buttons
        if (diffX < -75) {
            chatItem.classList.add('swiped');
        } else {
            chatItem.style.transform = '';
        }
    });
    
    // Mouse events (for desktop)
    let isMouseDown = false;
    
    chatItem.addEventListener('mousedown', (e) => {
        // Only handle clicks on the chat link, not the buttons
        if (e.target.closest('.chat-swipe-btn')) return;
        
        startX = e.clientX;
        isMouseDown = true;
    });
    
    chatItem.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        
        currentX = e.clientX;
        const diffX = currentX - startX;
        
        // Only allow swiping left
        if (diffX < 0) {
            // Limit swipe to -150px
            const translateX = Math.max(diffX, -150);
            chatItem.style.transform = `translateX(${translateX}px)`;
            
            // Prevent default to stop text selection
            e.preventDefault();
        }
    });
    
    chatItem.addEventListener('mouseup', () => {
        if (!isMouseDown) return;
        
        isMouseDown = false;
        
        const diffX = currentX - startX;
        
        // If swiped more than 75px, show action buttons
        if (diffX < -75) {
            chatItem.classList.add('swiped');
        } else {
            chatItem.style.transform = '';
        }
    });
    
    // Close swipe actions when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!chatItem.contains(e.target)) {
            chatItem.classList.remove('swiped');
            chatItem.style.transform = '';
        }
    });
}

/**
 * Show empty state
 */
function showEmptyState() {
    if (emptyState) {
        emptyState.classList.remove('hidden');
    }
}

/**
 * Hide empty state
 */
function hideEmptyState() {
    if (emptyState) {
        emptyState.classList.add('hidden');
    }
}

/**
 * Archive a chat
 * @param {string} chatId - Chat ID
 */
async function archiveChat(chatId) {
    try {
        utils.showLoading(true);
        
        // Update chat
        await dataStore.updateChat(chatId, { 
            isArchived: true,
            updatedAt: new Date().toISOString()
        });
        
        // Remove from list
        chats = chats.filter(chat => chat.id !== chatId);
        filterChats();
        renderChatList();
        
        utils.showToast('Chat archived', 'success');
        utils.showLoading(false);
    } catch (error) {
        console.error('Error archiving chat:', error);
        utils.showToast('Error archiving chat', 'error');
        utils.showLoading(false);
    }
}

/**
 * Confirm deleting a chat
 * @param {string} chatId - Chat ID
 */
function confirmDeleteChat(chatId) {
    utils.showConfirmDialog(
        'Are you sure you want to delete this chat? This action cannot be undone.',
        () => deleteChat(chatId),
        null,
        'Delete',
        'Cancel',
        'Delete Chat'
    );
}

/**
 * Delete a chat
 * @param {string} chatId - Chat ID
 */
async function deleteChat(chatId) {
    try {
        utils.showLoading(true);
        
        // Delete chat
        await dataStore.deleteChat(chatId);
        
        // Remove from list
        chats = chats.filter(chat => chat.id !== chatId);
        filterChats();
        renderChatList();
        
        utils.showToast('Chat deleted', 'success');
        utils.showLoading(false);
    } catch (error) {
        console.error('Error deleting chat:', error);
        utils.showToast('Error deleting chat', 'error');
        utils.showLoading(false);
    }
}

export { 
    initialize,
    renderChatList,
    filterChats,
    clearSearchQuery 
};