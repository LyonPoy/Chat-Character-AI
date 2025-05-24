/**
 * Login page functionality for the AI Character Chat application
 */

import utils from './utils.js';
import { t } from './translations.js';
import auth from './auth.js';
import { handleRedirectAfterLogin } from './navigation.js';

// DOM Elements
let loginForm;
let signupForm;
let emailField;
let passwordField;
let signupEmailField;
let signupPasswordField;
let confirmPasswordField;
let togglePasswordBtn;
let toggleSignupPasswordBtn;
let googleLoginBtn;
let anonymousLoginBtn;
let passwordStrength;
let loginToggleText;
let signupToggleText;
let loginToggle;
let signupToggle;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Cache DOM elements
    loginForm = utils.qs('#login-form');
    signupForm = utils.qs('#signup-form');
    emailField = utils.qs('#email');
    passwordField = utils.qs('#password');
    signupEmailField = utils.qs('#signup-email');
    signupPasswordField = utils.qs('#signup-password');
    confirmPasswordField = utils.qs('#confirm-password');
    togglePasswordBtn = utils.qs('#toggle-password');
    toggleSignupPasswordBtn = utils.qs('#toggle-signup-password');
    googleLoginBtn = utils.qs('#google-login');
    anonymousLoginBtn = utils.qs('#anonymous-login');
    passwordStrength = utils.qs('#password-strength');
    loginToggleText = utils.qs('#login-toggle-text');
    signupToggleText = utils.qs('#signup-toggle-text');
    loginToggle = utils.qs('#login-toggle');
    signupToggle = utils.qs('#signup-toggle');
    
    // Setup event listeners
    setupEventListeners();
    
    // Check for redirect result if using Firebase
    if (typeof firebase !== 'undefined') {
        try {
            // Get redirect result
            const result = await firebase.auth().getRedirectResult();
            
            if (result.user) {
                // User signed in after redirect
                utils.showToast(t('login_success'), 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    handleRedirectAfterLogin();
                }, 1000);
            }
        } catch (error) {
            console.error('Redirect error:', error);
            
            if (error.code) {
                if (error.code === 'auth/account-exists-with-different-credential') {
                    utils.showToast(t('account_exists_with_different_provider'), 'error');
                } else {
                    utils.showToast(error.message || t('login_failed'), 'error');
                }
            }
        }
    }
});

/**
 * Setup event listeners for the login page
 */
function setupEventListeners() {
    // Login form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Signup form
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Google login
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }
    
    // Anonymous login
    if (anonymousLoginBtn) {
        anonymousLoginBtn.addEventListener('click', handleAnonymousLogin);
    }
    
    // Toggle password visibility
    if (togglePasswordBtn && passwordField) {
        togglePasswordBtn.addEventListener('click', () => {
            togglePasswordVisibility(passwordField, togglePasswordBtn);
        });
    }
    
    // Toggle signup password visibility
    if (toggleSignupPasswordBtn && signupPasswordField) {
        toggleSignupPasswordBtn.addEventListener('click', () => {
            togglePasswordVisibility(signupPasswordField, toggleSignupPasswordBtn);
        });
    }
    
    // Password strength
    if (signupPasswordField && passwordStrength) {
        signupPasswordField.addEventListener('input', updatePasswordStrength);
    }
    
    // Toggle between login and signup forms
    if (loginToggle && signupToggle) {
        loginToggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleForms('login');
        });
        
        signupToggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleForms('signup');
        });
    }
}

/**
 * Toggle between login and signup forms
 * @param {string} form - The form to show ('login' or 'signup')
 */
function toggleForms(form) {
    if (form === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        loginToggleText.classList.remove('hidden');
        signupToggleText.classList.add('hidden');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        loginToggleText.classList.add('hidden');
        signupToggleText.classList.remove('hidden');
    }
}

/**
 * Handle login form submission
 * @param {Event} e - Form submit event
 */
async function handleLogin(e) {
    e.preventDefault();
    
    try {
        // Show loading
        utils.showLoading(true);
        
        // Get form values
        const email = emailField.value;
        const password = passwordField.value;
        
        // Validate
        if (!email) {
            throw new Error(t('email_required'));
        }
        
        if (!password) {
            throw new Error(t('password_required'));
        }
        
        // Sign in
        await auth.signInWithEmailAndPassword(email, password);
        
        // Show success message
        utils.showToast(t('login_success'), 'success');
        
        // Redirect after short delay
        setTimeout(() => {
            handleRedirectAfterLogin();
        }, 1000);
    } catch (error) {
        console.error('Login error:', error);
        utils.showToast(error.message || t('login_failed'), 'error');
        utils.showLoading(false);
    }
}

/**
 * Handle signup form submission
 * @param {Event} e - Form submit event
 */
async function handleSignup(e) {
    e.preventDefault();
    
    try {
        // Show loading
        utils.showLoading(true);
        
        // Get form values
        const email = signupEmailField.value;
        const password = signupPasswordField.value;
        const confirmPassword = confirmPasswordField.value;
        
        // Validate
        if (!email) {
            throw new Error(t('email_required'));
        }
        
        if (!password) {
            throw new Error(t('password_required'));
        }
        
        if (password.length < 6) {
            throw new Error(t('password_too_short'));
        }
        
        if (password !== confirmPassword) {
            throw new Error(t('passwords_dont_match'));
        }
        
        // Create user
        await auth.createUserWithEmailAndPassword(email, password);
        
        // Show success message
        utils.showToast(t('signup_success'), 'success');
        
        // Redirect after short delay
        setTimeout(() => {
            handleRedirectAfterLogin();
        }, 1000);
    } catch (error) {
        console.error('Signup error:', error);
        utils.showToast(error.message || t('signup_failed'), 'error');
        utils.showLoading(false);
    }
}

/**
 * Handle Google login
 */
async function handleGoogleLogin() {
    try {
        // Show loading
        utils.showLoading(true);
        
        if (typeof firebase !== 'undefined') {
            // Firebase is available, use Google Auth Provider
            const provider = new firebase.auth.GoogleAuthProvider();
            await firebase.auth().signInWithRedirect(provider);
            // The redirect result will be handled when the page loads
        } else {
            // Firebase not available, show error
            throw new Error(t('google_signin_not_available'));
        }
    } catch (error) {
        console.error('Google login error:', error);
        utils.showToast(error.message || t('google_login_failed'), 'error');
        utils.showLoading(false);
    }
}

/**
 * Handle anonymous login
 */
async function handleAnonymousLogin() {
    try {
        // Show loading
        utils.showLoading(true);
        
        // Sign in anonymously
        await auth.signInAnonymously();
        
        // Show success message
        utils.showToast(t('guest_login_success'), 'success');
        
        // Redirect after short delay
        setTimeout(() => {
            handleRedirectAfterLogin();
        }, 1000);
    } catch (error) {
        console.error('Anonymous login error:', error);
        utils.showToast(error.message || t('guest_login_failed'), 'error');
        utils.showLoading(false);
    }
}

/**
 * Toggle password visibility
 * @param {HTMLInputElement} passwordField - Password input element
 * @param {HTMLElement} toggleButton - Toggle button element
 */
function togglePasswordVisibility(passwordField, toggleButton) {
    const isPasswordVisible = passwordField.type === 'text';
    
    // Toggle password visibility
    passwordField.type = isPasswordVisible ? 'password' : 'text';
    
    // Toggle icon
    const icon = toggleButton.querySelector('i');
    
    if (icon) {
        if (isPasswordVisible) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    }
}

/**
 * Update password strength indicator
 */
function updatePasswordStrength() {
    if (!signupPasswordField || !passwordStrength) return;
    
    const password = signupPasswordField.value;
    const strengthBar = passwordStrength.querySelector('.strength-bar');
    const strengthText = passwordStrength.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    // Calculate password strength
    let strength = 0;
    let status = 'Too short';
    
    if (password.length > 0) {
        // Length check
        if (password.length >= 8) {
            strength += 25;
        }
        
        // Uppercase check
        if (/[A-Z]/.test(password)) {
            strength += 25;
        }
        
        // Lowercase check
        if (/[a-z]/.test(password)) {
            strength += 25;
        }
        
        // Number check
        if (/[0-9]/.test(password)) {
            strength += 25;
        }
        
        // Special character check
        if (/[^A-Za-z0-9]/.test(password)) {
            strength += 25;
        }
        
        // Cap at 100
        strength = Math.min(strength, 100);
        
        // Set status text
        if (strength < 25) {
            status = 'Very weak';
        } else if (strength < 50) {
            status = 'Weak';
        } else if (strength < 75) {
            status = 'Medium';
        } else {
            status = 'Strong';
        }
    }
    
    // Update strength bar
    strengthBar.style.width = `${strength}%`;
    
    // Update strength text
    strengthText.textContent = `Password strength: ${status}`;
    
    // Update strength bar color
    strengthBar.className = 'strength-bar';
    
    if (strength < 25) {
        strengthBar.classList.add('very-weak');
    } else if (strength < 50) {
        strengthBar.classList.add('weak');
    } else if (strength < 75) {
        strengthBar.classList.add('medium');
    } else {
        strengthBar.classList.add('strong');
    }
}

export {
    handleLogin,
    handleSignup,
    handleGoogleLogin,
    handleAnonymousLogin,
    togglePasswordVisibility,
    updatePasswordStrength,
    toggleForms
};