/**
 * Navigation functionality for the AI Character Chat application
 */

import utils from './utils.js';
import { t } from './translations.js';
import auth from './auth.js';

/**
 * Show overlay
 */
function showOverlay() {
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

/**
 * Hide overlay
 */
function hideOverlay() {
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

/**
 * Close all modals
 */
function closeAllModals() {
    // Get all modals
    const modals = document.querySelectorAll('.modal');
    
    // Hide all modals
    modals.forEach(modal => {
        modal.classList.add('hidden');
    });
    
    // Hide all popup menus
    const popupMenus = document.querySelectorAll('.popup-menu');
    popupMenus.forEach(menu => {
        menu.classList.add('hidden');
    });
    
    // Hide overlay
    hideOverlay();
}

/**
 * Handle page navigation
 * @param {string} url - URL to navigate to
 * @param {boolean} requireAuth - Whether authentication is required
 */
function navigateTo(url, requireAuth = false) {
    if (requireAuth && !auth.isSignedIn()) {
        // Redirect to login page
        window.location.href = 'login.html?redirect=' + encodeURIComponent(url);
        return;
    }
    
    // Navigate to URL
    window.location.href = url;
}

/**
 * Handle back button
 */
function goBack() {
    window.history.back();
}

/**
 * Initialize navigation for current page
 */
function initNavigation() {
    // Add click handlers for navigation items
    const navItems = document.querySelectorAll('nav a, .nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        const requireAuth = item.dataset.requireAuth === 'true';
        
        if (href) {
            item.addEventListener('click', (e) => {
                // Only handle navigation for internal links
                if (href.startsWith('http') || href.startsWith('//')) {
                    return; // Let the browser handle external links
                }
                
                // Check if user is logged in if auth is required
                if (requireAuth && !auth.isSignedIn()) {
                    e.preventDefault();
                    navigateTo('login.html?redirect=' + encodeURIComponent(href), true);
                }
            });
        }
    });
    
    // Handle back buttons
    const backButtons = document.querySelectorAll('.back-btn');
    
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            goBack();
        });
    });
}

/**
 * Get URL parameters
 * @returns {URLSearchParams} URL parameters
 */
function getUrlParams() {
    return new URLSearchParams(window.location.search);
}

/**
 * Handle redirect after login
 */
function handleRedirectAfterLogin() {
    const params = getUrlParams();
    const redirect = params.get('redirect');
    
    if (redirect) {
        // Navigate to redirect URL
        window.location.href = redirect;
    } else {
        // Default redirect to index page
        window.location.href = 'index.html';
    }
}

/**
 * Initialize the application based on current page
 */
function initPage() {
    // Initialize dark mode
    utils.initDarkMode();
    
    // Get current page from URL
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Handle login page logic
    if (currentPage === 'login.html') {
        // If user is already logged in, redirect to home
        if (auth.isSignedIn()) {
            handleRedirectAfterLogin();
        }
    } 
    // Handle pages that require authentication
    else if (['profile.html', 'settings.html', 'create-character.html'].includes(currentPage)) {
        // If user is not logged in, redirect to login page
        if (!auth.isSignedIn()) {
            navigateTo('login.html?redirect=' + encodeURIComponent(currentPage), true);
        }
    }
    
    // Set active nav item
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        
        if (href && href === currentPage) {
            item.classList.add('active');
            item.setAttribute('aria-current', 'page');
        } else {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
        }
    });
    
    // Initialize dark mode toggle
    const darkModeToggles = document.querySelectorAll('#dark-mode-toggle, #dark-mode-toggle-menu');
    
    darkModeToggles.forEach(toggle => {
        if (toggle.tagName === 'INPUT') {
            // It's a checkbox
            toggle.checked = utils.isDarkModeEnabled();
            
            toggle.addEventListener('change', () => {
                utils.toggleDarkMode(toggle.checked);
            });
        } else {
            // It's a menu item or button
            toggle.addEventListener('click', () => {
                const isDarkMode = utils.isDarkModeEnabled();
                utils.toggleDarkMode(!isDarkMode);
                
                // Update checkbox if it exists
                const checkbox = document.getElementById('dark-mode-toggle');
                if (checkbox) {
                    checkbox.checked = !isDarkMode;
                }
            });
        }
    });
}

// Initialize navigation on DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initPage();
});

// Export functions
export {
    showOverlay,
    hideOverlay,
    closeAllModals,
    navigateTo,
    goBack,
    getUrlParams,
    handleRedirectAfterLogin
};