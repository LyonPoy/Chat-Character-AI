/**
 * Authentication functionality for the AI Character Chat application
 */

import utils from './utils.js';
import firebaseConfig from './firebase-config.js';

class Auth {
    constructor() {
        this.currentUser = null;
        this.authStateListeners = [];
        this.initialized = false;
        this.auth = null;
    }

    /**
     * Initialize authentication state
     */
    async initAuthState() {
        if (this.initialized) return;
        
        try {
            // Initialize Firebase if available
            if (typeof firebase !== 'undefined') {
                // Initialize Firebase
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                
                this.auth = firebase.auth();
                
                // Set up auth state change listener
                this.auth.onAuthStateChanged((user) => {
                    this.currentUser = user;
                    this.notifyAuthStateListeners();
                });
            } else {
                console.warn('Firebase not available, using local auth');
                
                // Check if user is stored in localStorage
                const storedUser = localStorage.getItem('currentUser');
                
                if (storedUser) {
                    this.currentUser = JSON.parse(storedUser);
                    this.notifyAuthStateListeners();
                }
            }
            
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing auth state:', error);
        }
    }

    /**
     * Create a new user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} Promise that resolves with the user object
     */
    async createUserWithEmailAndPassword(email, password) {
        try {
            if (this.auth) {
                // Use Firebase Auth
                const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
                return userCredential.user;
            } else {
                // Fallback to local auth
                // Check if email is already in use
                const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
                const emailExists = existingUsers.some(user => user.email === email);
                
                if (emailExists) {
                    throw new Error('Email already in use');
                }
                
                // Create new user
                const newUser = {
                    uid: `user-${utils.generateId()}`,
                    email,
                    displayName: email.split('@')[0],
                    photoURL: null,
                    createdAt: new Date().toISOString(),
                    provider: 'email'
                };
                
                // Add to users
                existingUsers.push({
                    ...newUser,
                    password // In a real app, this would be hashed
                });
                
                localStorage.setItem('users', JSON.stringify(existingUsers));
                
                // Set as current user
                this.currentUser = newUser;
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                
                // Notify listeners
                this.notifyAuthStateListeners();
                
                return newUser;
            }
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    /**
     * Sign in with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} Promise that resolves with the user object
     */
    async signInWithEmailAndPassword(email, password) {
        try {
            if (this.auth) {
                // Use Firebase Auth
                const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
                return userCredential.user;
            } else {
                // Fallback to local auth
                const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
                const user = existingUsers.find(user => user.email === email && user.password === password);
                
                if (!user) {
                    throw new Error('Invalid email or password');
                }
                
                // Set as current user (without password)
                const { password: _, ...userWithoutPassword } = user;
                this.currentUser = userWithoutPassword;
                localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
                
                // Notify listeners
                this.notifyAuthStateListeners();
                
                return userWithoutPassword;
            }
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    }

    /**
     * Sign in anonymously
     * @returns {Promise} Promise that resolves with the user object
     */
    async signInAnonymously() {
        try {
            if (this.auth) {
                // Use Firebase Auth
                const userCredential = await this.auth.signInAnonymously();
                return userCredential.user;
            } else {
                // Fallback to local auth
                // Create anonymous user
                const guestUser = {
                    uid: 'guest',
                    email: null,
                    displayName: 'Guest User',
                    photoURL: null,
                    createdAt: new Date().toISOString(),
                    provider: 'anonymous'
                };
                
                // Set as current user
                this.currentUser = guestUser;
                localStorage.setItem('currentUser', JSON.stringify(guestUser));
                
                // Notify listeners
                this.notifyAuthStateListeners();
                
                return guestUser;
            }
        } catch (error) {
            console.error('Error signing in anonymously:', error);
            throw error;
        }
    }

    /**
     * Sign out the current user
     * @returns {Promise} Promise that resolves when sign out is complete
     */
    async signOut() {
        try {
            if (this.auth) {
                // Use Firebase Auth
                await this.auth.signOut();
            } else {
                // Fallback to local auth
                // Clear current user
                this.currentUser = null;
                localStorage.removeItem('currentUser');
                
                // Notify listeners
                this.notifyAuthStateListeners();
            }
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     * @param {Object} profileUpdates - Profile updates
     * @returns {Promise} Promise that resolves when update is complete
     */
    async updateProfile(profileUpdates) {
        try {
            if (!this.currentUser) {
                throw new Error('No user signed in');
            }
            
            if (this.auth && this.auth.currentUser) {
                // Use Firebase Auth
                await this.auth.currentUser.updateProfile(profileUpdates);
                return this.auth.currentUser;
            } else {
                // Fallback to local auth
                // Update current user
                this.currentUser = {
                    ...this.currentUser,
                    ...profileUpdates
                };
                
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                // If not anonymous, update in users array
                if (this.currentUser.provider !== 'anonymous') {
                    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
                    const userIndex = existingUsers.findIndex(user => user.uid === this.currentUser.uid);
                    
                    if (userIndex !== -1) {
                        existingUsers[userIndex] = {
                            ...existingUsers[userIndex],
                            ...profileUpdates
                        };
                        
                        localStorage.setItem('users', JSON.stringify(existingUsers));
                    }
                }
                
                // Notify listeners
                this.notifyAuthStateListeners();
                
                return this.currentUser;
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    /**
     * Add an auth state change listener
     * @param {Function} listener - Listener function
     */
    onAuthStateChanged(listener) {
        this.authStateListeners.push(listener);
        
        // Call listener immediately with current state
        if (this.initialized) {
            listener(this.currentUser);
        }
    }

    /**
     * Notify all auth state listeners
     */
    notifyAuthStateListeners() {
        this.authStateListeners.forEach(listener => {
            try {
                listener(this.currentUser);
            } catch (error) {
                console.error('Error in auth state listener:', error);
            }
        });
    }

    /**
     * Get current user
     * @returns {Object|null} Current user or null if not signed in
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is signed in
     * @returns {boolean} True if user is signed in
     */
    isSignedIn() {
        return !!this.currentUser;
    }
}

// Initialize auth and export singleton instance
const auth = new Auth();
auth.initAuthState();
export default auth;