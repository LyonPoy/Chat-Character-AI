/**
 * Character creation functionality for the AI Character Chat application
 */

import utils from './utils.js';
import { t } from './translations.js';
import auth from './auth.js';
import dataStore from './data.js';
import { showOverlay, hideOverlay } from './navigation.js';

// DOM Elements
let characterForm;
let pageTitle;
let avatarPreview;
let avatarUpload;
let characterName;
let characterShortDescription;
let characterFullDescription;
let characterPersonality;
let characterVoice;
let characterScenario;
let greetingMessage;
let dialogueExamplesContainer;
let addDialogueExampleBtn;
let showAvatarGalleryBtn;
let avatarGalleryModal;
let characterHelpModal;
let backBtn;
let saveCharacterBtn;
let cancelCharacterBtn;
let helpBtn;
let unsavedChangesModal;

// State
let isEditMode = false;
let characterId = null;
let formChanged = false;
let selectedAvatar = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Cache DOM elements
    characterForm = utils.qs('#create-character-form');
    pageTitle = utils.qs('#page-title');
    avatarPreview = utils.qs('#character-avatar-preview');
    avatarUpload = utils.qs('#character-avatar-upload');
    characterName = utils.qs('#character-name');
    characterShortDescription = utils.qs('#character-short-description');
    characterFullDescription = utils.qs('#character-full-description');
    characterPersonality = utils.qs('#character-personality');
    characterVoice = utils.qs('#character-voice');
    characterScenario = utils.qs('#character-scenario');
    greetingMessage = utils.qs('#greeting-message');
    dialogueExamplesContainer = utils.qs('#dialogue-examples');
    addDialogueExampleBtn = utils.qs('#add-dialogue-example');
    showAvatarGalleryBtn = utils.qs('#show-avatar-gallery');
    avatarGalleryModal = utils.qs('#avatar-gallery-modal');
    characterHelpModal = utils.qs('#character-help-modal');
    backBtn = utils.qs('#back-btn');
    saveCharacterBtn = utils.qs('#save-character');
    cancelCharacterBtn = utils.qs('#cancel-character');
    helpBtn = utils.qs('#help-btn');
    unsavedChangesModal = utils.qs('#unsaved-changes-modal');
    
    // Initialize
    try {
        await dataStore.init();
        
        // Check if in edit mode
        checkEditMode();
        
        // Setup form
        setupTextareaAutoResize();
        setupEventListeners();
        
        // Track form changes
        trackFormChanges();
    } catch (error) {
        console.error('Error initializing character creation page:', error);
        utils.showToast('Error initializing page', 'error');
    }
});

/**
 * Check if in edit mode (editing existing character)
 */
function checkEditMode() {
    // Get character ID from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    characterId = urlParams.get('id');
    
    if (characterId) {
        isEditMode = true;
        pageTitle.textContent = 'Edit Character';
        saveCharacterBtn.textContent = 'Update Character';
        
        // Load character data
        loadCharacter(characterId);
    }
}

/**
 * Load character data for editing
 * @param {string} id - Character ID
 */
function loadCharacter(id) {
    try {
        const character = dataStore.getCharacter(id);
        
        if (!character) {
            utils.showToast('Character not found', 'error');
            return;
        }
        
        // Populate form with character data
        fillFormWithCharacterData(character);
    } catch (error) {
        console.error('Error loading character data:', error);
        utils.showToast('Error loading character data', 'error');
    }
}

/**
 * Fill form with character data
 * @param {Object} character - Character data
 */
function fillFormWithCharacterData(character) {
    // Set avatar
    if (character.avatarUrl) {
        avatarPreview.src = character.avatarUrl;
    }
    
    // Set basic info
    characterName.value = character.name || '';
    characterShortDescription.value = character.description || '';
    characterFullDescription.value = character.fullDescription || '';
    
    // Set categories
    const categoryCheckboxes = utils.qsa('input[name="categories"]');
    categoryCheckboxes.forEach(checkbox => {
        if (character.categories && character.categories.includes(checkbox.value)) {
            checkbox.checked = true;
        }
    });
    
    // Set tags
    if (character.tags && character.tags.length > 0) {
        loadTags(character.tags);
    }
    
    // Set personality info
    characterPersonality.value = character.personality || '';
    characterVoice.value = character.voice || '';
    characterScenario.value = character.scenario || '';
    greetingMessage.value = character.greeting || '';
    
    // Set dialogue examples
    if (character.dialogueExamples && character.dialogueExamples.length > 0) {
        // Clear default example
        dialogueExamplesContainer.innerHTML = '';
        
        // Add each example
        character.dialogueExamples.forEach(example => {
            addDialogueExample(example.user, example.character);
        });
    }
    
    // Set advanced settings
    const visibilitySelect = utils.qs('#character-visibility');
    if (visibilitySelect) {
        visibilitySelect.value = character.visibility || 'private';
    }
    
    const nsfwToggle = utils.qs('#character-nsfw');
    if (nsfwToggle) {
        nsfwToggle.checked = character.nsfw || false;
    }
    
    const modelSelect = utils.qs('#character-model');
    if (modelSelect) {
        modelSelect.value = character.preferredModel || 'default';
    }
}

/**
 * Set up event listeners for the character creation page
 */
function setupEventListeners() {
    // Avatar upload
    if (avatarUpload) {
        avatarUpload.addEventListener('change', handleAvatarUpload);
    }
    
    // Show avatar gallery
    if (showAvatarGalleryBtn && avatarGalleryModal) {
        showAvatarGalleryBtn.addEventListener('click', showAvatarGallery);
        
        // Close avatar gallery
        const closeGalleryBtn = utils.qs('#close-avatar-gallery');
        if (closeGalleryBtn) {
            closeGalleryBtn.addEventListener('click', () => {
                avatarGalleryModal.classList.add('hidden');
                hideOverlay();
            });
        }
        
        // Avatar gallery tabs
        const galleryTabs = utils.qsa('.avatar-gallery-tabs .tab-btn');
        galleryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                galleryTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const tabId = tab.dataset.tab;
                const tabContents = utils.qsa('.avatar-gallery-tab');
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                const activeContent = utils.qs(`#${tabId}-tab`);
                if (activeContent) {
                    activeContent.classList.add('active');
                }
            });
        });
        
        // Load premade avatars
        loadPremadeAvatars();
        
        // Generate avatar button
        const generateAvatarBtn = utils.qs('#generate-avatar-btn');
        if (generateAvatarBtn) {
            generateAvatarBtn.addEventListener('click', generateAvatar);
        }
        
        // Select avatar button
        const selectAvatarBtn = utils.qs('#select-avatar-btn');
        if (selectAvatarBtn) {
            selectAvatarBtn.addEventListener('click', () => {
                if (selectedAvatar) {
                    avatarPreview.src = selectedAvatar;
                    avatarGalleryModal.classList.add('hidden');
                    hideOverlay();
                }
            });
        }
    }
    
    // Character tags input
    const tagsInput = utils.qs('#character-tags-input');
    if (tagsInput) {
        tagsInput.addEventListener('keydown', handleTagsInput);
    }
    
    // Add dialogue example
    if (addDialogueExampleBtn) {
        addDialogueExampleBtn.addEventListener('click', () => {
            addDialogueExample();
        });
    }
    
    // Form submission
    if (characterForm) {
        characterForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Cancel button
    if (cancelCharacterBtn) {
        cancelCharacterBtn.addEventListener('click', () => {
            if (formChanged) {
                unsavedChangesModal.classList.remove('hidden');
                showOverlay();
            } else {
                window.location.href = 'character.html';
            }
        });
    }
    
    // Back button
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (formChanged) {
                unsavedChangesModal.classList.remove('hidden');
                showOverlay();
            } else {
                window.location.href = 'character.html';
            }
        });
    }
    
    // Unsaved changes modal
    const closeUnsavedModal = utils.qs('#close-unsaved-modal');
    const discardChangesBtn = utils.qs('#discard-changes');
    const continueEditingBtn = utils.qs('#continue-editing');
    
    if (closeUnsavedModal) {
        closeUnsavedModal.addEventListener('click', () => {
            unsavedChangesModal.classList.add('hidden');
            hideOverlay();
        });
    }
    
    if (discardChangesBtn) {
        discardChangesBtn.addEventListener('click', () => {
            window.location.href = 'character.html';
        });
    }
    
    if (continueEditingBtn) {
        continueEditingBtn.addEventListener('click', () => {
            unsavedChangesModal.classList.add('hidden');
            hideOverlay();
        });
    }
    
    // Help button
    if (helpBtn && characterHelpModal) {
        helpBtn.addEventListener('click', showHelpModal);
        
        // Close help modal
        const closeHelpBtn = utils.qs('#close-character-help');
        const gotItBtn = utils.qs('#close-help-btn');
        
        if (closeHelpBtn) {
            closeHelpBtn.addEventListener('click', () => {
                characterHelpModal.classList.add('hidden');
                hideOverlay();
            });
        }
        
        if (gotItBtn) {
            gotItBtn.addEventListener('click', () => {
                characterHelpModal.classList.add('hidden');
                hideOverlay();
            });
        }
    }
    
    // Overlay click
    const overlay = utils.qs('#overlay');
    if (overlay) {
        overlay.addEventListener('click', () => {
            avatarGalleryModal?.classList.add('hidden');
            characterHelpModal?.classList.add('hidden');
            hideOverlay();
        });
    }
    
    // Window beforeunload
    window.addEventListener('beforeunload', (e) => {
        if (formChanged) {
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    });
}

/**
 * Handle avatar upload
 * @param {Event} e - Change event
 */
function handleAvatarUpload(e) {
    const file = e.target.files[0];
    
    if (file) {
        if (!file.type.startsWith('image/')) {
            utils.showToast('Please select an image file', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            avatarPreview.src = event.target.result;
            formChanged = true;
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Show avatar gallery modal
 */
function showAvatarGallery() {
    avatarGalleryModal.classList.remove('hidden');
    showOverlay();
}

/**
 * Load premade avatars in the gallery
 */
function loadPremadeAvatars() {
    const avatarGrid = utils.qs('#premade-avatars');
    
    if (!avatarGrid) return;
    
    // Clear existing avatars
    avatarGrid.innerHTML = '';
    
    // Mock avatar URLs (in a real app, these would come from a server)
    const avatarUrls = [
        'https://ui-avatars.com/api/?name=AI&background=random',
        'https://ui-avatars.com/api/?name=Bot&background=random',
        'https://ui-avatars.com/api/?name=Chat&background=random',
        'https://ui-avatars.com/api/?name=Hero&background=random',
        'https://ui-avatars.com/api/?name=Buddy&background=random',
        'https://ui-avatars.com/api/?name=Friend&background=random',
        'https://ui-avatars.com/api/?name=Helper&background=random',
        'https://ui-avatars.com/api/?name=Wizard&background=random'
    ];
    
    // Create avatar items
    avatarUrls.forEach(url => {
        const avatarItem = document.createElement('div');
        avatarItem.className = 'avatar-item';
        
        const avatarImg = document.createElement('img');
        avatarImg.src = url;
        avatarImg.alt = 'Character avatar';
        
        avatarItem.appendChild(avatarImg);
        
        // Add click event
        avatarItem.addEventListener('click', () => {
            // Remove selected class from all avatars
            const allAvatars = utils.qsa('.avatar-item');
            allAvatars.forEach(avatar => avatar.classList.remove('selected'));
            
            // Add selected class to clicked avatar
            avatarItem.classList.add('selected');
            
            // Update selected avatar
            selectedAvatar = url;
            
            // Enable select button
            const selectBtn = utils.qs('#select-avatar-btn');
            if (selectBtn) {
                selectBtn.removeAttribute('disabled');
            }
        });
        
        avatarGrid.appendChild(avatarItem);
    });
}

/**
 * Generate AI avatar (mock implementation)
 */
function generateAvatar() {
    const prompt = utils.qs('#avatar-prompt')?.value;
    
    if (!prompt) {
        utils.showToast('Please enter a description for the avatar', 'warning');
        return;
    }
    
    utils.showLoading(true);
    
    // In a real app, this would call an AI image generation API
    // For now, we'll just use a placeholder service
    setTimeout(() => {
        const avatarGrid = utils.qs('#generated-avatars');
        
        if (avatarGrid) {
            // Create a new avatar item
            const avatarItem = document.createElement('div');
            avatarItem.className = 'avatar-item';
            
            const avatarImg = document.createElement('img');
            // Use the prompt to create a "random" avatar
            avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(prompt.substring(0, 2))}&background=random`;
            avatarImg.alt = prompt;
            
            avatarItem.appendChild(avatarImg);
            
            // Add click event
            avatarItem.addEventListener('click', () => {
                // Remove selected class from all avatars
                const allAvatars = utils.qsa('.avatar-item');
                allAvatars.forEach(avatar => avatar.classList.remove('selected'));
                
                // Add selected class to clicked avatar
                avatarItem.classList.add('selected');
                
                // Update selected avatar
                selectedAvatar = avatarImg.src;
                
                // Enable select button
                const selectBtn = utils.qs('#select-avatar-btn');
                if (selectBtn) {
                    selectBtn.removeAttribute('disabled');
                }
            });
            
            avatarGrid.appendChild(avatarItem);
        }
        
        utils.showLoading(false);
        utils.showToast('Avatar generated!', 'success');
    }, 2000);
}

/**
 * Handle tags input
 * @param {Event} e - Keydown event
 */
function handleTagsInput(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        
        const input = e.target;
        const value = input.value.trim();
        
        if (value) {
            addTag(value);
            input.value = '';
            formChanged = true;
        }
    }
}

/**
 * Add a tag to the tags container
 * @param {string} tag - Tag text
 */
function addTag(tag) {
    const tagsContainer = utils.qs('#character-tags');
    
    if (!tagsContainer) return;
    
    // Check if tag already exists
    const existingTags = Array.from(tagsContainer.querySelectorAll('.tag-item')).map(tag => tag.textContent.trim());
    
    if (existingTags.includes(tag)) {
        utils.showToast('Tag already exists', 'warning');
        return;
    }
    
    // Create tag element
    const tagElement = document.createElement('div');
    tagElement.className = 'tag-item';
    tagElement.textContent = tag;
    
    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'tag-remove';
    removeBtn.innerHTML = '&times;';
    removeBtn.setAttribute('aria-label', `Remove tag ${tag}`);
    
    removeBtn.addEventListener('click', () => {
        tagElement.remove();
        formChanged = true;
    });
    
    tagElement.appendChild(removeBtn);
    tagsContainer.appendChild(tagElement);
}

/**
 * Load tags from array
 * @param {Array} tags - Array of tags
 */
function loadTags(tags) {
    tags.forEach(tag => addTag(tag));
}

/**
 * Get current tags as array
 * @returns {Array} - Array of tags
 */
function getTags() {
    const tagsContainer = utils.qs('#character-tags');
    
    if (!tagsContainer) return [];
    
    return Array.from(tagsContainer.querySelectorAll('.tag-item')).map(tag => tag.textContent.trim());
}

/**
 * Add a dialogue example to the form
 * @param {string} userText - User message text
 * @param {string} characterText - Character response text
 */
function addDialogueExample(userText = '', characterText = '') {
    // Create new dialogue example
    const dialogueExample = document.createElement('div');
    dialogueExample.className = 'dialogue-example';
    
    // User message
    const userRow = document.createElement('div');
    userRow.className = 'dialogue-row';
    
    const userLabel = document.createElement('label');
    userLabel.textContent = 'User:';
    
    const userInput = document.createElement('input');
    userInput.type = 'text';
    userInput.className = 'dialogue-user';
    userInput.placeholder = 'Example user message';
    userInput.value = userText;
    
    userRow.appendChild(userLabel);
    userRow.appendChild(userInput);
    
    // Character message
    const characterRow = document.createElement('div');
    characterRow.className = 'dialogue-row';
    
    const characterLabel = document.createElement('label');
    characterLabel.textContent = 'Character:';
    
    const characterInput = document.createElement('input');
    characterInput.type = 'text';
    characterInput.className = 'dialogue-character';
    characterInput.placeholder = 'Example character response';
    characterInput.value = characterText;
    
    characterRow.appendChild(characterLabel);
    characterRow.appendChild(characterInput);
    
    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-example-btn';
    removeBtn.innerHTML = '<i class="fas fa-trash" aria-hidden="true"></i>';
    removeBtn.setAttribute('aria-label', 'Remove dialogue example');
    
    removeBtn.addEventListener('click', () => {
        dialogueExample.remove();
        formChanged = true;
    });
    
    // Append elements
    dialogueExample.appendChild(userRow);
    dialogueExample.appendChild(characterRow);
    dialogueExample.appendChild(removeBtn);
    
    // Add event listeners to track changes
    userInput.addEventListener('input', () => {
        formChanged = true;
    });
    
    characterInput.addEventListener('input', () => {
        formChanged = true;
    });
    
    // Append to container
    dialogueExamplesContainer.appendChild(dialogueExample);
}

/**
 * Get dialogue examples from form
 * @returns {Array} - Array of dialogue examples
 */
function getDialogueExamples() {
    const examples = [];
    
    const dialogueExamples = utils.qsa('.dialogue-example');
    
    dialogueExamples.forEach(example => {
        const userText = example.querySelector('.dialogue-user').value.trim();
        const characterText = example.querySelector('.dialogue-character').value.trim();
        
        if (userText && characterText) {
            examples.push({
                user: userText,
                character: characterText
            });
        }
    });
    
    return examples;
}

/**
 * Setup auto-resize for textareas
 */
function setupTextareaAutoResize() {
    const textareas = utils.qsa('textarea');
    
    textareas.forEach(textarea => {
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        });
        
        // Initialize height
        textarea.style.height = `${textarea.scrollHeight}px`;
    });
}

/**
 * Get selected categories
 * @returns {Array} - Array of selected categories
 */
function getSelectedCategories() {
    const checkboxes = utils.qsa('input[name="categories"]:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.value);
}

/**
 * Handle form submission
 * @param {Event} e - Submit event
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    try {
        utils.showLoading(true);
        
        // Get form values
        const characterData = {
            name: characterName.value.trim(),
            description: characterShortDescription.value.trim(),
            fullDescription: characterFullDescription.value.trim(),
            personality: characterPersonality.value.trim(),
            voice: characterVoice.value.trim(),
            scenario: characterScenario.value.trim(),
            greeting: greetingMessage.value.trim(),
            categories: getSelectedCategories(),
            tags: getTags(),
            dialogueExamples: getDialogueExamples(),
            visibility: utils.qs('#character-visibility').value,
            nsfw: utils.qs('#character-nsfw').checked,
            preferredModel: utils.qs('#character-model').value,
            avatarUrl: avatarPreview.src
        };
        
        if (isEditMode) {
            // Update existing character
            await dataStore.updateCharacter(characterId, characterData);
            utils.showToast('Character updated successfully!', 'success');
        } else {
            // Create new character
            await dataStore.createCharacter(characterData);
            utils.showToast('Character created successfully!', 'success');
        }
        
        // Reset form state
        formChanged = false;
        
        // Redirect to characters page
        setTimeout(() => {
            window.location.href = 'character.html';
        }, 1500);
    } catch (error) {
        console.error('Error saving character:', error);
        utils.showToast('Error saving character', 'error');
        utils.showLoading(false);
    }
}

/**
 * Validate the character form
 * @returns {boolean} - Whether the form is valid
 */
function validateForm() {
    let isValid = true;
    
    // Reset validation state
    const inputs = utils.qsa('.form-group input, .form-group textarea, .form-group select');
    inputs.forEach(input => setValid(input));
    
    // Validate required fields
    if (!characterName.value.trim()) {
        setInvalid(characterName, 'Please enter a character name');
        isValid = false;
    }
    
    if (!characterShortDescription.value.trim()) {
        setInvalid(characterShortDescription, 'Please enter a short description');
        isValid = false;
    }
    
    if (!characterFullDescription.value.trim()) {
        setInvalid(characterFullDescription, 'Please enter a full description');
        isValid = false;
    }
    
    if (!characterPersonality.value.trim()) {
        setInvalid(characterPersonality, 'Please describe the character\'s personality');
        isValid = false;
    }
    
    if (!greetingMessage.value.trim()) {
        setInvalid(greetingMessage, 'Please enter a greeting message');
        isValid = false;
    }
    
    // Validate dialogue examples
    const dialogueExamples = getDialogueExamples();
    if (dialogueExamples.length === 0) {
        utils.showToast('Please add at least one dialogue example', 'error');
        isValid = false;
    }
    
    // Validate tags
    const tags = getTags();
    if (tags.length === 0) {
        const tagsInput = utils.qs('#character-tags-input');
        setInvalid(tagsInput, 'Please add at least one tag');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Set input as invalid
 * @param {HTMLElement} input - Input element
 * @param {string} message - Error message
 */
function setInvalid(input, message) {
    input.classList.add('invalid');
    
    // Find or create error message element
    let errorElement = input.parentNode.querySelector('.error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        input.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    
    // Scroll to first invalid input
    if (!document.querySelector('.invalid:first-of-type')) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Set input as valid
 * @param {HTMLElement} input - Input element
 */
function setValid(input) {
    input.classList.remove('invalid');
    
    // Remove error message
    const errorElement = input.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

/**
 * Track form changes
 */
function trackFormChanges() {
    const inputs = utils.qsa('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            formChanged = true;
        });
        
        input.addEventListener('change', () => {
            formChanged = true;
        });
    });
}

/**
 * Show help modal
 */
function showHelpModal() {
    characterHelpModal.classList.remove('hidden');
    showOverlay();
}

export {
    checkEditMode,
    loadCharacter,
    fillFormWithCharacterData,
    handleAvatarUpload,
    showAvatarGallery,
    handleTagsInput,
    addTag,
    loadTags,
    getTags,
    addDialogueExample,
    getDialogueExamples,
    getSelectedCategories,
    handleFormSubmit,
    validateForm
};