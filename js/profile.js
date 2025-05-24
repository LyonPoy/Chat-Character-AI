/**
 * Profile functionality for the AI Character Chat application
 */

import utils from './utils.js';
import { t } from './translations.js';
import { auth } from './auth.js';
import dataStore from './data.js';

// DOM elements
const profileForm = utils.qs('#profile-form');
const displayName = utils.qs('#display-name');
const userBio = utils.qs('#user-bio');
const pronouns = utils.qs('#pronouns');
const birthDate = utils.qs('#birth-date');
const communicationStyle = utils.qs('#communication-style');
const messageLength = utils.qs('#message-length');
const interestsInput = utils.qs('#interests-input');
const interestsTags = utils.qs('#interests-tags');
const goals = utils.qs('#goals');
const avoidTopics = utils.qs('#avoid');
const userAvatar = utils.qs('#user-avatar');
const avatarUpload = utils.qs('#profile-avatar-upload');
const saveProfileBtn = utils.qs('#save-profile');
const genderRadios = document.getElementsByName('gender');
const chatCount = utils.qs('#chat-count');
const characterCount = utils.qs('#character-count');
const messageCount = utils.qs('#message-count');
const exportAllDataBtn = utils.qs('#export-all-data');
const deleteAccountBtn = utils.qs('#delete-account');
const privacySettingsBtn = utils.qs('#privacy-settings-btn');
const userName = utils.qs('#user-name');

// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
    // Load user profile
    loadUserProfile();
    
    // Load user statistics
    loadUserStats();
    
    // Setup event listeners
    setupEventListeners();
});

/**
 * Load user profile data
 */
async function loadUserProfile() {
    try {
        const user = auth.getCurrentUser();
        const profile = dataStore.profile.get();
        
        // Set name in header
        if (userName && user) {
            userName.textContent = user.displayName || 'User';
        }
        
        // Set avatar
        if (userAvatar && user) {
            userAvatar.src = user.photoURL || utils.generateAvatar(user.displayName || 'User');
        }
        
        // Fill form with profile data
        if (displayName) {
            displayName.value = user?.displayName || '';
        }
        
        if (userBio) {
            userBio.value = profile.bio || '';
        }
        
        if (pronouns) {
            pronouns.value = profile.pronouns || '';
        }
        
        if (birthDate) {
            birthDate.value = profile.birthDate || '';
        }
        
        if (communicationStyle) {
            communicationStyle.value = profile.communicationStyle || 'friendly';
        }
        
        if (messageLength) {
            messageLength.value = profile.messageLength || 'medium';
        }
        
        if (goals) {
            goals.value = profile.goals || '';
        }
        
        if (avoidTopics) {
            avoidTopics.value = profile.avoidTopics || '';
        }
        
        // Set gender
        if (profile.gender) {
            for (const radio of genderRadios) {
                if (radio.value === profile.gender) {
                    radio.checked = true;
                    break;
                }
            }
        }
        
        // Load interests tags
        if (interestsTags && profile.interests) {
            loadTags(profile.interests);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        utils.showToast('Failed to load profile data', 'error');
    }
}

/**
 * Load user statistics
 */
function loadUserStats() {
    try {
        const stats = dataStore.stats.get();
        
        if (chatCount) {
            chatCount.textContent = stats.chatCount;
        }
        
        if (characterCount) {
            characterCount.textContent = stats.characterCount;
        }
        
        if (messageCount) {
            messageCount.textContent = stats.messageCount;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

/**
 * Set up event listeners for the profile page
 */
function setupEventListeners() {
    // Profile form submission
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }
    
    // Avatar upload
    if (avatarUpload) {
        avatarUpload.addEventListener('change', handleAvatarUpload);
    }
    
    // Interests tags input
    if (interestsInput) {
        interestsInput.addEventListener('keydown', handleInterestsInput);
    }
    
    // Export all data button
    if (exportAllDataBtn) {
        exportAllDataBtn.addEventListener('click', exportAllData);
    }
    
    // Delete account button
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', confirmDeleteAccount);
    }
    
    // Privacy settings button
    if (privacySettingsBtn) {
        privacySettingsBtn.addEventListener('click', showPrivacyModal);
    }
    
    // Save privacy settings button
    const savePrivacyBtn = utils.qs('#save-privacy-settings');
    if (savePrivacyBtn) {
        savePrivacyBtn.addEventListener('click', savePrivacySettings);
    }
    
    // Close privacy modal buttons
    const closePrivacyModalBtn = utils.qs('#close-privacy-modal');
    const cancelPrivacyBtn = utils.qs('#cancel-privacy-modal');
    
    if (closePrivacyModalBtn) {
        closePrivacyModalBtn.addEventListener('click', hidePrivacyModal);
    }
    
    if (cancelPrivacyBtn) {
        cancelPrivacyBtn.addEventListener('click', hidePrivacyModal);
    }
}

/**
 * Handle profile form submission
 * @param {Event} e - Form submit event
 */
async function handleProfileSubmit(e) {
    e.preventDefault();
    
    try {
        utils.showLoading(true);
        
        // Get form values
        const profileData = {
            bio: userBio?.value || '',
            pronouns: pronouns?.value || '',
            birthDate: birthDate?.value || '',
            communicationStyle: communicationStyle?.value || 'friendly',
            messageLength: messageLength?.value || 'medium',
            goals: goals?.value || '',
            avoidTopics: avoidTopics?.value || '',
            interests: getTags()
        };
        
        // Get selected gender
        for (const radio of genderRadios) {
            if (radio.checked) {
                profileData.gender = radio.value;
                break;
            }
        }
        
        // Update display name in auth profile if changed
        const user = auth.getCurrentUser();
        const newDisplayName = displayName?.value || '';
        
        if (user && newDisplayName !== user.displayName) {
            await auth.updateProfile({
                displayName: newDisplayName
            });
            
            // Update name in header
            if (userName) {
                userName.textContent = newDisplayName || 'User';
            }
        }
        
        // Save profile data
        await dataStore.profile.update(profileData);
        
        utils.showToast('Profile updated successfully', 'success');
    } catch (error) {
        console.error('Error saving profile:', error);
        utils.showToast('Failed to save profile', 'error');
    } finally {
        utils.showLoading(false);
    }
}

/**
 * Handle avatar upload
 * @param {Event} e - File input change event
 */
async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        utils.showToast('Please select an image file', 'error');
        return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        utils.showToast('Image size should be less than 2MB', 'error');
        return;
    }
    
    try {
        utils.showLoading(true);
        
        // Read file as data URL
        const reader = new FileReader();
        
        reader.onload = async (event) => {
            const dataUrl = event.target.result;
            
            // Update avatar preview
            if (userAvatar) {
                userAvatar.src = dataUrl;
            }
            
            // Update user profile
            try {
                await auth.updateProfile({
                    photoURL: dataUrl
                });
                
                utils.showToast('Avatar updated successfully', 'success');
            } catch (error) {
                console.error('Error updating avatar:', error);
                utils.showToast('Failed to update avatar', 'error');
            } finally {
                utils.showLoading(false);
            }
        };
        
        reader.onerror = () => {
            utils.showToast('Error reading file', 'error');
            utils.showLoading(false);
        };
        
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Error processing avatar:', error);
        utils.showToast('Failed to process avatar', 'error');
        utils.showLoading(false);
    }
}

/**
 * Handle interests input
 * @param {Event} e - Keydown event
 */
function handleInterestsInput(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        
        const tag = e.target.value.trim();
        if (tag && tag.length > 0) {
            addTag(tag);
            e.target.value = '';
        }
    }
}

/**
 * Add a tag to interests
 * @param {string} tag - Tag to add
 */
function addTag(tag) {
    if (!interestsTags) return;
    
    // Create tag element
    const tagElement = document.createElement('div');
    tagElement.classList.add('tag');
    tagElement.innerHTML = `
        <span>${tag}</span>
        <button type="button" class="tag-remove" aria-label="Remove tag">
            <i class="fas fa-times" aria-hidden="true"></i>
        </button>
    `;
    
    // Add remove event listener
    const removeBtn = tagElement.querySelector('.tag-remove');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            tagElement.remove();
        });
    }
    
    // Add to container
    interestsTags.appendChild(tagElement);
}

/**
 * Load tags from array
 * @param {Array} tags - Array of tags
 */
function loadTags(tags) {
    if (!interestsTags || !Array.isArray(tags)) return;
    
    // Clear existing tags
    interestsTags.innerHTML = '';
    
    // Add each tag
    tags.forEach(tag => {
        addTag(tag);
    });
}

/**
 * Get current tags as array
 * @returns {Array} - Array of tags
 */
function getTags() {
    if (!interestsTags) return [];
    
    const tags = [];
    const tagElements = interestsTags.querySelectorAll('.tag');
    
    tagElements.forEach(element => {
        const tagText = element.querySelector('span')?.textContent;
        if (tagText) {
            tags.push(tagText);
        }
    });
    
    return tags;
}

/**
 * Export all user data
 */
function exportAllData() {
    try {
        const userData = dataStore.export.asJSON();
        const blob = new Blob([userData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-character-chat-data-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        utils.showToast('Data exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting data:', error);
        utils.showToast('Failed to export data', 'error');
    }
}

/**
 * Confirm account deletion
 */
function confirmDeleteAccount() {
    utils.showConfirmDialog(
        'Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone.',
        deleteAccount,
        null,
        'Delete Account',
        'Cancel',
        'Delete Account'
    );
}

/**
 * Delete user account
 */
async function deleteAccount() {
    try {
        utils.showLoading(true);
        
        // Clear all user data from localStorage
        const userId = auth.getCurrentUser()?.uid || 'anonymous';
        localStorage.removeItem(`userData_${userId}`);
        
        // Sign out
        await auth.signOut();
        
        utils.showToast('Account deleted successfully', 'success');
        
        // Redirect to login page
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error deleting account:', error);
        utils.showToast('Failed to delete account', 'error');
    } finally {
        utils.showLoading(false);
    }
}

/**
 * Show privacy settings modal
 */
function showPrivacyModal() {
    const modal = utils.qs('#privacy-modal');
    const overlay = utils.qs('#overlay');
    
    if (modal && overlay) {
        // Load current settings
        const settings = dataStore.settings.get();
        
        // Update toggle switches
        const shareDataToggle = utils.qs('#share-usage-data');
        const notificationsToggle = utils.qs('#allow-notifications');
        const onlineStatusToggle = utils.qs('#show-online-status');
        const darkModeToggle = utils.qs('#dark-mode-toggle');
        
        if (shareDataToggle) {
            shareDataToggle.checked = settings.shareUsageData || false;
        }
        
        if (notificationsToggle) {
            notificationsToggle.checked = settings.allowNotifications || false;
        }
        
        if (onlineStatusToggle) {
            onlineStatusToggle.checked = settings.showOnlineStatus || true;
        }
        
        if (darkModeToggle) {
            darkModeToggle.checked = document.body.classList.contains('dark-mode');
        }
        
        // Show modal
        modal.classList.remove('hidden');
        overlay.classList.remove('hidden');
    }
}

/**
 * Hide privacy settings modal
 */
function hidePrivacyModal() {
    const modal = utils.qs('#privacy-modal');
    const overlay = utils.qs('#overlay');
    
    if (modal && overlay) {
        modal.classList.add('hidden');
        overlay.classList.add('hidden');
    }
}

/**
 * Save privacy settings
 */
async function savePrivacySettings() {
    try {
        utils.showLoading(true);
        
        // Get values from toggles
        const shareDataToggle = utils.qs('#share-usage-data');
        const notificationsToggle = utils.qs('#allow-notifications');
        const onlineStatusToggle = utils.qs('#show-online-status');
        const darkModeToggle = utils.qs('#dark-mode-toggle');
        
        const updatedSettings = {
            shareUsageData: shareDataToggle?.checked || false,
            allowNotifications: notificationsToggle?.checked || false,
            showOnlineStatus: onlineStatusToggle?.checked || true
        };
        
        // Update dark mode separately
        if (darkModeToggle) {
            utils.toggleDarkMode(darkModeToggle.checked);
        }
        
        // Save settings
        await dataStore.settings.update(updatedSettings);
        
        utils.showToast('Privacy settings saved', 'success');
        
        // Hide modal
        hidePrivacyModal();
    } catch (error) {
        console.error('Error saving privacy settings:', error);
        utils.showToast('Failed to save settings', 'error');
    } finally {
        utils.showLoading(false);
    }
}
