/**
 * Utility functions for the AI Character Chat application
 */

const utils = {
    /**
     * Generate a random ID
     * @returns {string} Random ID
     */
    generateId() {
        return Math.random().toString(36).substring(2, 10);
    },
    
    /**
     * Query selector shorthand
     * @param {string} selector - CSS selector
     * @param {Element} context - Context element (defaults to document)
     * @returns {Element} First matching element or null
     */
    qs(selector, context = document) {
        return context.querySelector(selector);
    },
    
    /**
     * Query selector all shorthand
     * @param {string} selector - CSS selector
     * @param {Element} context - Context element (defaults to document)
     * @returns {NodeList} List of matching elements
     */
    qsa(selector, context = document) {
        return context.querySelectorAll(selector);
    },
    
    /**
     * Get URL parameters
     * @returns {URLSearchParams} URL search params
     */
    getUrlParams() {
        return new URLSearchParams(window.location.search);
    },
    
    /**
     * Format date to human readable string
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date string
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    /**
     * Format time to human readable string
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted time string
     */
    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    /**
     * Format date and time to human readable string
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date and time string
     */
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    /**
     * Format relative time (e.g. "2 hours ago")
     * @param {string} dateString - ISO date string
     * @returns {string} Relative time string
     */
    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffSeconds = Math.floor((now - date) / 1000);
        
        if (diffSeconds < 60) {
            return 'just now';
        }
        
        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMinutes < 60) {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        }
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        }
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        }
        
        const diffWeeks = Math.floor(diffDays / 7);
        if (diffWeeks < 4) {
            return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
        }
        
        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths < 12) {
            return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
        }
        
        const diffYears = Math.floor(diffDays / 365);
        return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    },
    
    /**
     * Truncate text to a certain length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },
    
    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Notification type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.getElementById('notification-toast');
        
        if (!toast) return;
        
        // Clear any existing timeout
        if (toast.timeoutId) {
            clearTimeout(toast.timeoutId);
        }
        
        // Set toast content and class
        toast.textContent = message;
        toast.className = 'toast';
        toast.classList.add(type);
        toast.classList.remove('hidden');
        
        // Auto-hide after duration
        toast.timeoutId = setTimeout(() => {
            toast.classList.add('hidden');
        }, duration);
    },
    
    /**
     * Show/hide loading overlay
     * @param {boolean} show - Whether to show or hide
     */
    showLoading(show) {
        const loadingOverlay = document.getElementById('loading-overlay');
        
        if (!loadingOverlay) return;
        
        if (show) {
            loadingOverlay.classList.remove('hidden');
        } else {
            loadingOverlay.classList.add('hidden');
        }
    },
    
    /**
     * Generate random avatar URL based on name
     * @param {string} name - Name to generate avatar for
     * @returns {string} Avatar URL
     */
    generateAvatar(name) {
        const colors = [
            '0D8ABC', // Blue
            '556B2F', // Olive Green
            '8B4513', // Saddle Brown
            '4B0082', // Indigo
            '8B0000', // Dark Red
            '2E8B57', // Sea Green
            '800080', // Purple
            '191970', // Midnight Blue
            'B8860B', // Dark Goldenrod
            '006400'  // Dark Green
        ];
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff`;
    },
    
    /**
     * Detect mobile device
     * @returns {boolean} Whether the device is mobile
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    /**
     * Format markdown-like content to HTML
     * @param {string} content - Raw content with markdown-like formatting
     * @returns {string} HTML formatted content
     */
    formatContent(content) {
        if (!content) return '';
        
        // Replace URLs with links
        content = content.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        // Replace bold text
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Replace italic text
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Replace newlines with <br>
        content = content.replace(/\n/g, '<br>');
        
        return content;
    },
    
    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                func(...args);
            };
            
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle function to limit function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit = 300) {
        let inThrottle;
        
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                
                setTimeout(() => {
                    inThrottle = false;
                }, limit);
            }
        };
    },
    
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise} Promise that resolves when copy is complete
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            
            // Fallback for older browsers
            try {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return true;
            } catch (fallbackError) {
                console.error('Fallback copy failed:', fallbackError);
                return false;
            }
        }
    },
    
    /**
     * Download data as file
     * @param {string} data - Data to download
     * @param {string} filename - Filename
     * @param {string} type - MIME type
     */
    downloadFile(data, filename, type = 'text/plain') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            URL.revokeObjectURL(url);
            document.body.removeChild(link);
        }, 100);
    },
    
    /**
     * Get readable file size
     * @param {number} bytes - Size in bytes
     * @returns {string} Readable file size
     */
    getReadableFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    /**
     * Toggle dark mode
     * @param {boolean} enable - Whether to enable or disable dark mode
     */
    toggleDarkMode(enable) {
        const body = document.body;
        
        if (enable) {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            localStorage.setItem('darkMode', 'false');
        }
    },
    
    /**
     * Check if dark mode is enabled
     * @returns {boolean} Whether dark mode is enabled
     */
    isDarkModeEnabled() {
        return document.body.classList.contains('dark-mode');
    },
    
    /**
     * Initialize dark mode based on user preference
     */
    initDarkMode() {
        const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        this.toggleDarkMode(darkModeEnabled ?? prefersDarkMode);
    }
};

// Export utils object
export default utils;