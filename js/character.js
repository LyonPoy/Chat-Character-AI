/**
 * Character browsing and selection functionality for the AI Character Chat application
 */

import utils from './utils.js';
import { t } from './translations.js';
import auth from './auth.js';
import dataStore from './data.js';
import { showOverlay, hideOverlay, closeAllModals } from './navigation.js';

// DOM Elements
let characterContainer;
let allCharactersGrid;
let popularCharactersGrid;
let recentCharactersGrid;
let myCharactersGrid;
let emptyCharactersState;
let searchBar;
let searchInput;
let clearSearchBtn;
let tabButtons;
let characterDetailModal;
let characterMenu;

// State
let characters = [];
let filteredCharacters = [];
let currentTab = 'all';
let currentSort = 'newest';
let searchQuery = '';
let filters = {
    categories: [],
    contentRating: 'all'
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Cache DOM elements
    characterContainer = utils.qs('#character-container');
    allCharactersGrid = utils.qs('#all-characters-grid');
    popularCharactersGrid = utils.qs('#popular-characters-grid');
    recentCharactersGrid = utils.qs('#recent-characters-grid');
    myCharactersGrid = utils.qs('#my-characters-grid');
    emptyCharactersState = utils.qs('#empty-characters-state');
    searchBar = utils.qs('#search-bar');
    searchInput = utils.qs('#character-search');
    clearSearchBtn = utils.qs('#clear-search');
    tabButtons = utils.qsa('.tab-btn');
    characterDetailModal = utils.qs('#character-detail-modal');
    characterMenu = utils.qs('#character-menu');
    
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
        
        // Load characters
        loadCharacters();
        
        // Apply initial filtering and sorting
        filterAndSortCharacters();
        
        // Render characters
        renderCharacters();
        
        utils.showLoading(false);
    } catch (error) {
        console.error('Error initializing character page:', error);
        utils.showToast('Error loading characters', 'error');
        utils.showLoading(false);
    }
}

/**
 * Load characters from dataStore
 */
async function loadCharacters() {
    characters = dataStore.getCharacters();
    filteredCharacters = [...characters];
}

/**
 * Filter and sort characters based on current filters and search
 */
function filterAndSortCharacters() {
    // First apply search filter if present
    if (searchQuery) {
        filteredCharacters = characters.filter(character => {
            const nameMatch = character.name.toLowerCase().includes(searchQuery);
            const descriptionMatch = character.description.toLowerCase().includes(searchQuery);
            const tagsMatch = character.tags && character.tags.some(tag => tag.toLowerCase().includes(searchQuery));
            
            return nameMatch || descriptionMatch || tagsMatch;
        });
    } else {
        filteredCharacters = [...characters];
    }
    
    // Apply category filters if present
    if (filters.categories.length > 0) {
        filteredCharacters = filteredCharacters.filter(character => {
            return filters.categories.includes(character.category);
        });
    }
    
    // Apply content rating filter
    if (filters.contentRating === 'sfw') {
        filteredCharacters = filteredCharacters.filter(character => !character.nsfw);
    }
    
    // Apply current tab filter
    switch (currentTab) {
        case 'popular':
            // No real popularity metric in our mock data, so we'll just use a random subset
            filteredCharacters = filteredCharacters.filter(() => Math.random() > 0.3);
            break;
        case 'recent':
            // Sort by creation date (newest first) and take top 10
            filteredCharacters = [...filteredCharacters].sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }).slice(0, 10);
            break;
        case 'mycharacters':
            // Filter to only user-created characters
            filteredCharacters = filteredCharacters.filter(character => {
                const userId = auth.getCurrentUser()?.uid;
                return character.creator === userId;
            });
            break;
    }
    
    // Apply sorting
    switch (currentSort) {
        case 'newest':
            filteredCharacters.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            filteredCharacters.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'alphabetical':
            filteredCharacters.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'alphabetical-desc':
            filteredCharacters.sort((a, b) => b.name.localeCompare(a.name));
            break;
        // 'popularity' sort would go here if we had that data
    }
}

/**
 * Render characters in the grid
 */
function renderCharacters() {
    // Get the current tab's grid
    let targetGrid;
    switch (currentTab) {
        case 'all':
            targetGrid = allCharactersGrid;
            break;
        case 'popular':
            targetGrid = popularCharactersGrid;
            break;
        case 'recent':
            targetGrid = recentCharactersGrid;
            break;
        case 'mycharacters':
            targetGrid = myCharactersGrid;
            break;
    }
    
    // Clear the grid
    if (targetGrid) {
        targetGrid.innerHTML = '';
    }
    
    // Show empty state if no characters
    if (filteredCharacters.length === 0) {
        if (emptyCharactersState) {
            emptyCharactersState.classList.remove('hidden');
        }
        return;
    }
    
    // Hide empty state
    if (emptyCharactersState) {
        emptyCharactersState.classList.add('hidden');
    }
    
    // Get the character card template
    const template = document.getElementById('character-card-template');
    
    // Render each character
    filteredCharacters.forEach(character => {
        const card = createCharacterCard(character, template);
        if (targetGrid) {
            targetGrid.appendChild(card);
        }
    });
}

/**
 * Create a character card element
 * @param {Object} character - Character data
 * @returns {HTMLElement} - Character card element
 */
function createCharacterCard(character, template) {
    if (!template) return;
    
    // Clone the template content
    const card = document.importNode(template.content, true).firstElementChild;
    
    // Set character data
    const characterImage = card.querySelector('.character-image');
    const characterName = card.querySelector('.character-name');
    const characterDescription = card.querySelector('.character-description');
    const characterTags = card.querySelector('.character-tags');
    
    // Set image
    if (characterImage) {
        characterImage.src = character.avatarUrl || utils.generateAvatar(character.name);
        characterImage.alt = character.name;
    }
    
    // Set name
    if (characterName) {
        characterName.textContent = character.name;
    }
    
    // Set description (truncated)
    if (characterDescription) {
        characterDescription.textContent = utils.truncateText(character.description, 80);
    }
    
    // Set tags
    if (characterTags && character.tags && character.tags.length > 0) {
        characterTags.innerHTML = '';
        
        // Display up to 3 tags
        const tagsToShow = character.tags.slice(0, 3);
        
        tagsToShow.forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'character-tag';
            tagEl.textContent = tag;
            characterTags.appendChild(tagEl);
        });
    }
    
    // Set data attribute for character ID
    card.dataset.id = character.id;
    
    // Set up action buttons
    const chatBtn = card.querySelector('.chat-btn');
    const infoBtn = card.querySelector('.info-btn');
    const favoriteBtn = card.querySelector('.favorite-btn');
    
    if (chatBtn) {
        chatBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startChatWithCharacter(character.id);
        });
    }
    
    if (infoBtn) {
        infoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showCharacterDetails(character);
        });
    }
    
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Toggle favorite state
            const isCurrentlyFavorite = favoriteBtn.querySelector('i').classList.contains('fas');
            
            if (isCurrentlyFavorite) {
                favoriteBtn.querySelector('i').classList.remove('fas');
                favoriteBtn.querySelector('i').classList.add('far');
                utils.showToast(`Removed ${character.name} from favorites`);
            } else {
                favoriteBtn.querySelector('i').classList.remove('far');
                favoriteBtn.querySelector('i').classList.add('fas');
                utils.showToast(`Added ${character.name} to favorites`);
            }
        });
    }
    
    // Make the entire card clickable to show details
    card.addEventListener('click', () => {
        showCharacterDetails(character);
    });
    
    return card;
}

/**
 * Show character details modal
 * @param {Object} character - Character data
 */
function showCharacterDetails(character) {
    if (!characterDetailModal) return;
    
    // Populate character details
    const detailAvatar = utils.qs('#detail-avatar');
    const detailName = utils.qs('#detail-name');
    const detailCreator = utils.qs('#detail-creator');
    const detailDescription = utils.qs('#detail-description');
    const detailPersonality = utils.qs('#detail-personality');
    const detailExampleChat = utils.qs('#detail-example-chat');
    const detailTags = utils.qs('#detail-tags');
    const startChatWithCharacterBtn = utils.qs('#start-chat-with-character');
    const editCharacterBtn = utils.qs('#edit-character');
    
    // Set avatar
    if (detailAvatar) {
        detailAvatar.src = character.avatarUrl || utils.generateAvatar(character.name);
        detailAvatar.alt = character.name;
    }
    
    // Set name
    if (detailName) {
        detailName.textContent = character.name;
    }
    
    // Set creator info
    if (detailCreator) {
        if (character.creator === 'system') {
            detailCreator.textContent = 'Official Character';
        } else {
            detailCreator.textContent = 'Custom Character';
        }
    }
    
    // Set description
    if (detailDescription) {
        detailDescription.textContent = character.description || 'No description available.';
    }
    
    // Set personality
    if (detailPersonality) {
        detailPersonality.textContent = character.personality || 'No personality information available.';
    }
    
    // Set example chat
    if (detailExampleChat) {
        detailExampleChat.innerHTML = '';
        
        if (character.dialogueExamples && character.dialogueExamples.length > 0) {
            character.dialogueExamples.forEach(example => {
                // User message
                const userMessage = document.createElement('div');
                userMessage.className = 'message-group outgoing';
                userMessage.innerHTML = `
                    <div class="message">
                        <div class="message-content">${example.user}</div>
                    </div>
                `;
                
                // Character response
                const characterMessage = document.createElement('div');
                characterMessage.className = 'message-group incoming';
                characterMessage.innerHTML = `
                    <div class="avatar small">
                        <img src="${character.avatarUrl || utils.generateAvatar(character.name)}" alt="${character.name}">
                    </div>
                    <div class="message">
                        <div class="message-content">${example.character}</div>
                    </div>
                `;
                
                detailExampleChat.appendChild(userMessage);
                detailExampleChat.appendChild(characterMessage);
            });
        } else {
            detailExampleChat.innerHTML = '<p class="text-muted">No example conversation available.</p>';
        }
    }
    
    // Set tags
    if (detailTags) {
        detailTags.innerHTML = '';
        
        if (character.tags && character.tags.length > 0) {
            character.tags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'character-tag';
                tagEl.textContent = tag;
                detailTags.appendChild(tagEl);
            });
        } else {
            detailTags.innerHTML = '<p class="text-muted">No tags available.</p>';
        }
    }
    
    // Set up "Start Chat" button
    if (startChatWithCharacterBtn) {
        startChatWithCharacterBtn.onclick = () => {
            closeAllModals();
            startChatWithCharacter(character.id);
        };
    }
    
    // Handle edit button visibility (only show for user's own characters)
    if (editCharacterBtn) {
        const isUserCharacter = character.creator === auth.getCurrentUser()?.uid;
        editCharacterBtn.style.display = isUserCharacter ? 'block' : 'none';
        
        editCharacterBtn.onclick = () => {
            closeAllModals();
            window.location.href = `create-character.html?id=${character.id}`;
        };
    }
    
    // Show the modal
    characterDetailModal.classList.remove('hidden');
    showOverlay();
}

/**
 * Start a chat with a character
 * @param {string} characterId - Character ID
 */
async function startChatWithCharacter(characterId) {
    try {
        utils.showLoading(true);
        
        // Get character
        const character = dataStore.getCharacter(characterId);
        if (!character) {
            throw new Error('Character not found');
        }
        
        // Look for existing chat with this character
        const existingChat = dataStore.getChats().find(chat => chat.characterId === characterId);
        
        // If chat exists, navigate to it
        if (existingChat) {
            window.location.href = `chat.html?id=${existingChat.id}`;
            return;
        }
        
        // Create a new chat
        const newChat = await dataStore.createChat({
            characterId,
            messages: [
                {
                    sender: 'character',
                    content: `Hello! I'm ${character.name}. ${character.greeting || 'How can I help you today?'}`,
                    timestamp: new Date().toISOString()
                }
            ]
        });
        
        // Navigate to the new chat
        window.location.href = `chat.html?id=${newChat.id}`;
    } catch (error) {
        console.error('Error starting chat:', error);
        utils.showToast('Error starting chat', 'error');
        utils.showLoading(false);
    }
}

/**
 * Setup featured characters section
 */
function setupFeaturedCharacters() {
    // For demonstration, we're just using the default characters as featured
    // In a real app, you'd have some criteria for "featuring" characters
}

/**
 * Set up event listeners for the character page
 */
function setupEventListeners() {
    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active tab
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update current tab
            currentTab = btn.dataset.tab;
            
            // Hide all tab content
            const tabs = utils.qsa('.character-tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // Show current tab content
            const currentTabContent = utils.qs(`#${currentTab}-tab`);
            if (currentTabContent) {
                currentTabContent.classList.add('active');
            }
            
            // Refresh characters
            filterAndSortCharacters();
            renderCharacters();
        });
    });
    
    // Search button
    const searchBtn = utils.qs('#search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            if (searchBar) {
                searchBar.classList.toggle('hidden');
                
                // Focus search input when showing
                if (!searchBar.classList.contains('hidden')) {
                    searchInput.focus();
                }
            }
        });
    }
    
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchQuery = searchInput.value.trim().toLowerCase();
            
            // Show/hide clear button
            if (clearSearchBtn) {
                clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
            }
            
            // Filter and render characters
            filterAndSortCharacters();
            renderCharacters();
        });
    }
    
    // Clear search button
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.style.display = 'none';
            
            // Filter and render characters
            filterAndSortCharacters();
            renderCharacters();
        });
    }
    
    // Create character button
    const createCharacterBtn = utils.qs('#create-character-btn');
    if (createCharacterBtn) {
        createCharacterBtn.addEventListener('click', () => {
            window.location.href = 'create-character.html';
        });
    }
    
    // Empty state create button
    const emptyCreateCharacterBtn = utils.qs('#empty-create-character-btn');
    if (emptyCreateCharacterBtn) {
        emptyCreateCharacterBtn.addEventListener('click', () => {
            window.location.href = 'create-character.html';
        });
    }
    
    // Character menu button
    const characterMenuBtn = utils.qs('#character-menu-btn');
    if (characterMenuBtn && characterMenu) {
        characterMenuBtn.addEventListener('click', () => {
            characterMenu.classList.toggle('hidden');
            
            if (!characterMenu.classList.contains('hidden')) {
                showOverlay();
            } else {
                hideOverlay();
            }
        });
    }
    
    // Character menu items
    const filterCharactersBtn = utils.qs('#filter-characters');
    const sortCharactersBtn = utils.qs('#sort-characters');
    const importCharacterBtn = utils.qs('#import-character');
    const closeCharacterMenuBtn = utils.qs('#close-character-menu');
    
    if (filterCharactersBtn) {
        filterCharactersBtn.addEventListener('click', () => {
            if (characterMenu) characterMenu.classList.add('hidden');
            const filterModal = utils.qs('#filter-modal');
            if (filterModal) {
                filterModal.classList.remove('hidden');
            }
        });
    }
    
    if (sortCharactersBtn) {
        sortCharactersBtn.addEventListener('click', () => {
            if (characterMenu) characterMenu.classList.add('hidden');
            const sortModal = utils.qs('#sort-modal');
            if (sortModal) {
                sortModal.classList.remove('hidden');
            }
        });
    }
    
    if (importCharacterBtn) {
        importCharacterBtn.addEventListener('click', () => {
            if (characterMenu) characterMenu.classList.add('hidden');
            utils.showToast('Import character feature coming soon', 'info');
        });
    }
    
    if (closeCharacterMenuBtn) {
        closeCharacterMenuBtn.addEventListener('click', () => {
            if (characterMenu) characterMenu.classList.add('hidden');
            hideOverlay();
        });
    }
    
    // Filter modal
    const applyFiltersBtn = utils.qs('#apply-filters');
    const resetFiltersBtn = utils.qs('#reset-filters');
    const closeFilterModalBtn = utils.qs('#close-filter-modal');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            // Get selected categories
            const categoryCheckboxes = utils.qsa('.filter-section input[type="checkbox"]:checked');
            const selectedCategories = Array.from(categoryCheckboxes).map(cb => cb.id.replace('filter-', ''));
            
            // Get content rating
            const contentRatingRadios = utils.qsa('input[name="content-rating"]');
            const selectedContentRating = Array.from(contentRatingRadios).find(r => r.checked)?.value || 'all';
            
            // Update filters
            filters.categories = selectedCategories;
            filters.contentRating = selectedContentRating;
            
            // Apply filters
            filterAndSortCharacters();
            renderCharacters();
            
            // Close modal
            const filterModal = utils.qs('#filter-modal');
            if (filterModal) {
                filterModal.classList.add('hidden');
            }
            hideOverlay();
        });
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            // Reset checkboxes
            const categoryCheckboxes = utils.qsa('.filter-section input[type="checkbox"]');
            categoryCheckboxes.forEach(cb => cb.checked = false);
            
            // Reset content rating
            const allContentRadio = utils.qs('input[name="content-rating"][value="all"]');
            if (allContentRadio) {
                allContentRadio.checked = true;
            }
            
            // Reset filters
            filters.categories = [];
            filters.contentRating = 'all';
            
            // Apply filters
            filterAndSortCharacters();
            renderCharacters();
            
            // Close modal
            const filterModal = utils.qs('#filter-modal');
            if (filterModal) {
                filterModal.classList.add('hidden');
            }
            hideOverlay();
        });
    }
    
    if (closeFilterModalBtn) {
        closeFilterModalBtn.addEventListener('click', () => {
            const filterModal = utils.qs('#filter-modal');
            if (filterModal) {
                filterModal.classList.add('hidden');
            }
            hideOverlay();
        });
    }
    
    // Sort modal
    const applySortBtn = utils.qs('#apply-sort');
    const closeSortModalBtn = utils.qs('#close-sort-modal');
    
    if (applySortBtn) {
        applySortBtn.addEventListener('click', () => {
            // Get selected sort option
            const sortRadios = utils.qsa('input[name="sort-option"]');
            const selectedSort = Array.from(sortRadios).find(r => r.checked)?.value || 'newest';
            
            // Update sort
            currentSort = selectedSort;
            
            // Apply sort
            filterAndSortCharacters();
            renderCharacters();
            
            // Close modal
            const sortModal = utils.qs('#sort-modal');
            if (sortModal) {
                sortModal.classList.add('hidden');
            }
            hideOverlay();
        });
    }
    
    if (closeSortModalBtn) {
        closeSortModalBtn.addEventListener('click', () => {
            const sortModal = utils.qs('#sort-modal');
            if (sortModal) {
                sortModal.classList.add('hidden');
            }
            hideOverlay();
        });
    }
    
    // Character detail modal close button
    const closeCharacterDetailBtn = utils.qs('#close-character-detail');
    if (closeCharacterDetailBtn) {
        closeCharacterDetailBtn.addEventListener('click', () => {
            if (characterDetailModal) {
                characterDetailModal.classList.add('hidden');
            }
            hideOverlay();
        });
    }
    
    // Close overlay
    const overlay = utils.qs('#overlay');
    if (overlay) {
        overlay.addEventListener('click', () => {
            // Close any open modal or menu
            if (characterDetailModal) characterDetailModal.classList.add('hidden');
            if (characterMenu) characterMenu.classList.add('hidden');
            
            const filterModal = utils.qs('#filter-modal');
            if (filterModal) filterModal.classList.add('hidden');
            
            const sortModal = utils.qs('#sort-modal');
            if (sortModal) sortModal.classList.add('hidden');
            
            hideOverlay();
        });
    }
}

export {
    loadCharacters,
    filterAndSortCharacters,
    renderCharacters,
    createCharacterCard,
    showCharacterDetails,
    startChatWithCharacter,
    setupFeaturedCharacters,
    setupEventListeners
};