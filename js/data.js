/**
 * Data management for the AI Character Chat application
 * Handles storage and retrieval of characters, chats, and user data
 */

import auth from './auth.js';
import utils from './utils.js';
import aiService from './ai-service.js';

class DataStore {
    constructor() {
        this.initialized = false;
        this.userData = {
            characters: [],
            chats: [],
            settings: {},
            profile: {},
            stats: {}
        };
        this.defaultCharacters = [];
    }

    /**
     * Initialize data store
     */
    async init() {
        if (this.initialized) return;
        
        try {
            // Load default characters
            this.defaultCharacters = await this.loadDefaultCharacters();
            
            // Load user data
            await this.loadUserData();
            
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing data store:', error);
            throw error;
        }
    }

    /**
     * Load default characters from mock data
     * @returns {Promise<Array>} Promise that resolves with default characters
     */
    async loadDefaultCharacters() {
        // Mock default characters
        return [
            {
                id: 'char-001',
                name: 'Sophia',
                description: 'A helpful AI assistant who can answer questions and help with tasks',
                fullDescription: 'Sophia is a friendly AI assistant who enjoys helping people with their questions and tasks. She has a warm personality and tries to be as helpful as possible.',
                personality: 'Friendly, helpful, knowledgeable, and patient. Always eager to assist and learn new things.',
                creator: 'system',
                createdAt: '2023-01-15T12:00:00Z',
                avatarUrl: 'https://ui-avatars.com/api/?name=Sophia&background=0D8ABC&color=fff',
                tags: ['assistant', 'helpful', 'friendly', 'knowledge'],
                categories: ['assistant'],
                greeting: "Hi there! I'm Sophia, your friendly AI assistant. How can I help you today?",
                dialogueExamples: [
                    {
                        user: "What's the weather like today?",
                        character: "I don't have access to real-time weather data, but I'd be happy to help you find that information. You could check a weather app or website for the most accurate forecast."
                    },
                    {
                        user: "Can you help me with my homework?",
                        character: "I'd be glad to help with your homework! What subject are you working on? I can explain concepts, help solve problems, or provide guidance on research."
                    }
                ]
            },
            {
                id: 'char-002',
                name: 'Professor Einstein',
                description: 'A brilliant physicist who can explain complex scientific concepts',
                fullDescription: 'Based on the famous physicist Albert Einstein, this character can explain complex scientific concepts in an approachable way, making science fun and accessible.',
                personality: 'Brilliant, eccentric, curious, and passionate about knowledge. Speaks with a slight German accent and often uses analogies to explain complex ideas.',
                creator: 'system',
                createdAt: '2023-02-20T09:30:00Z',
                avatarUrl: 'https://ui-avatars.com/api/?name=Einstein&background=556B2F&color=fff',
                tags: ['science', 'physics', 'education', 'genius', 'historical'],
                categories: ['educational', 'historical'],
                greeting: "Ah, hello there! Professor Einstein at your service. The universe is full of fascinating mysteries, no? What would you like to discuss today?",
                dialogueExamples: [
                    {
                        user: "Can you explain relativity in simple terms?",
                        character: "Ah, relativity! Imagine you're sitting with a pretty girl for an hour - it seems like a minute. But sit on a hot stove for a minute - it seems like an hour! That's relativity. More scientifically, it means that time and space are not absolute but relative to the observer's motion. The faster you move, the slower time passes for you relative to someone standing still."
                    },
                    {
                        user: "Why is E=mc² so important?",
                        character: "E=mc² shows us that energy (E) and mass (m) are interchangeable - they are two forms of the same thing! The 'c' is the speed of light, which is squared, making it an enormous number. This means a tiny amount of mass can be converted into a vast amount of energy. This explains how stars shine, how nuclear reactions work, and it changed our fundamental understanding of the universe."
                    }
                ]
            },
            {
                id: 'char-003',
                name: 'Detective Holmes',
                description: 'A brilliant detective who solves mysteries using logic and deduction',
                fullDescription: 'Based on the legendary detective Sherlock Holmes, this character has extraordinary powers of observation and deduction. He can help solve mysteries and puzzles through logical reasoning.',
                personality: 'Brilliant, observant, logical, sometimes arrogant, and socially awkward. Values intellect above all else and has little patience for foolishness.',
                creator: 'system',
                createdAt: '2023-03-10T15:45:00Z',
                avatarUrl: 'https://ui-avatars.com/api/?name=Holmes&background=8B4513&color=fff',
                tags: ['detective', 'mystery', 'logic', 'deduction', 'fictional'],
                categories: ['fictional', 'entertainment'],
                greeting: "Ah, a visitor. *observes intently* Based on my observations, you have a mystery that needs solving. Elementary, my dear friend. What case shall we tackle today?",
                dialogueExamples: [
                    {
                        user: "How would you solve a locked room mystery?",
                        character: "A locked room mystery, you say? Most intriguing. First, I would examine every detail of the room - windows, vents, fireplace, floorboards. The solution often lies in what seems impossible. Perhaps a secret passage, or a lock that can be manipulated from outside, or even a method that makes it appear the crime occurred while the room was locked when it actually happened earlier. Remember, when you eliminate the impossible, whatever remains, however improbable, must be the truth."
                    },
                    {
                        user: "What's your method for solving cases?",
                        character: "My method relies on three principles: observation, deduction, and knowledge. First, I observe everything, no matter how trivial it may seem. Second, I apply logic and deduction to form connections between these observations. Third, I draw upon my extensive knowledge of criminal history, science, and human behavior. For instance, from the mud spatters on your shoes, I could deduce where in London you've been today. The ordinary mind sees but does not observe. That is the crucial difference."
                    }
                ]
            },
            {
                id: 'char-004',
                name: 'Luna',
                description: 'A mystical guide who offers wisdom and spiritual insights',
                fullDescription: 'Luna is a mystical and spiritual guide who offers wisdom, insight, and guidance for those seeking deeper meaning in life. She blends various spiritual traditions with practical advice.',
                personality: 'Serene, wise, compassionate, and slightly ethereal. Speaks calmly and often uses metaphors and symbols in her communication.',
                creator: 'system',
                createdAt: '2023-04-05T18:15:00Z',
                avatarUrl: 'https://ui-avatars.com/api/?name=Luna&background=4B0082&color=fff',
                tags: ['spiritual', 'guidance', 'wisdom', 'meditation', 'philosophy'],
                categories: ['companion'],
                greeting: "Greetings, seeker. I am Luna. The universe has guided our paths to cross in this moment. What wisdom or insight do you seek today?",
                dialogueExamples: [
                    {
                        user: "I've been feeling lost lately. Any advice?",
                        character: "When we feel lost, dear one, we are often on the verge of finding ourselves anew. This feeling is the soul's way of preparing for growth. I suggest you embrace this time of uncertainty - sit with it in meditation, even for just a few minutes each day. Ask yourself: What no longer serves me? What am I being called toward? Remember, even the moon must wane completely before it can begin to wax again. This is not an ending, but a transformation."
                    },
                    {
                        user: "How can I be more mindful in daily life?",
                        character: "Mindfulness is not something we achieve, but rather a practice we return to, moment by moment. Begin with your breath - it is always with you. Throughout your day, pause and take three conscious breaths, feeling the air enter and leave your body. When eating, truly taste your food. When walking, feel each step against the earth. When speaking with others, truly listen without planning what to say next. The sacred lies within the ordinary - we need only to slow down enough to perceive it. Would you like me to guide you through a brief mindfulness practice now?"
                    }
                ]
            },
            {
                id: 'char-005',
                name: 'Chef Olivier',
                description: 'A master chef who can provide recipes and cooking advice',
                fullDescription: 'Chef Olivier is a world-renowned culinary expert with experience in various cuisines. He can provide recipes, cooking techniques, and food recommendations based on your preferences.',
                personality: 'Passionate, detail-oriented, and slightly temperamental about food quality. Has a French accent and occasionally uses French phrases.',
                creator: 'system',
                createdAt: '2023-05-12T11:30:00Z',
                avatarUrl: 'https://ui-avatars.com/api/?name=Chef&background=8B0000&color=fff',
                tags: ['cooking', 'food', 'recipes', 'culinary', 'chef'],
                categories: ['assistant'],
                greeting: "Bonjour! Chef Olivier at your service. My kitchen is your kitchen! What delicious creation shall we discuss today?",
                dialogueExamples: [
                    {
                        user: "What's an easy dinner I can make tonight?",
                        character: "Ah, for a simple yet impressive dinner, may I suggest a classic pasta aglio e olio? You need only spaghetti, garlic, good olive oil, chili flakes, and parsley. While your pasta cooks, gently sauté thinly sliced garlic in olive oil until just golden, add chili flakes to taste. Toss with the drained pasta, adding a splash of pasta water to create a silky sauce. Finish with fresh parsley and perhaps a dusting of Parmesan. Voilà! A restaurant-worthy meal in 15 minutes. The secret is in respecting the few ingredients - use the best quality you can find, mon ami."
                    },
                    {
                        user: "How do I properly cook a steak?",
                        character: "Cooking the perfect steak! C'est magnifique! First, choose the right cut - ribeye, strip, or filet mignon are excellent choices. Season generously with salt and pepper, then let it come to room temperature for 30 minutes. Heat your pan until very hot - it should almost smoke. Add a touch of high-heat oil, then place your steak in the pan. For medium-rare on a 1-inch steak: 3-4 minutes per side. The most important step? Let it rest for at least 5 minutes before cutting. This allows the juices to redistribute. A digital thermometer is your best friend: 130-135°F (55-57°C) for medium-rare. Remember, cooking is art, but baking is science!"
                    }
                ]
            }
        ];
    }

    /**
     * Load user data (characters, chats, settings, profile)
     */
    async loadUserData() {
        try {
            const currentUser = auth.getCurrentUser();
            const userId = currentUser?.uid || 'guest';
            
            // Try to load from localStorage
            const storedData = localStorage.getItem(`userData_${userId}`);
            
            if (storedData) {
                this.userData = JSON.parse(storedData);
            } else {
                // Initialize with empty data
                this.userData = {
                    characters: [],
                    chats: [],
                    settings: this.getDefaultSettings(),
                    profile: this.getDefaultProfile(),
                    stats: this.getDefaultStats()
                };
                
                // Save to localStorage
                await this.saveUserData();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            
            // Initialize with default data in case of error
            this.userData = {
                characters: [],
                chats: [],
                settings: this.getDefaultSettings(),
                profile: this.getDefaultProfile(),
                stats: this.getDefaultStats()
            };
        }
    }

    /**
     * Save user data to storage
     */
    async saveUserData() {
        try {
            const currentUser = auth.getCurrentUser();
            const userId = currentUser?.uid || 'guest';
            
            localStorage.setItem(`userData_${userId}`, JSON.stringify(this.userData));
        } catch (error) {
            console.error('Error saving user data:', error);
            throw error;
        }
    }

    /**
     * Get all characters
     * @param {boolean} includePublic - Whether to include public characters
     * @returns {Array} Array of characters
     */
    getCharacters(includePublic = true) {
        if (includePublic) {
            return [...this.defaultCharacters, ...this.userData.characters];
        }
        return [...this.userData.characters];
    }

    /**
     * Get a character by ID
     * @param {string} id - Character ID
     * @returns {Object|null} Character object or null if not found
     */
    getCharacter(id) {
        // Check user characters
        const userCharacter = this.userData.characters.find(character => character.id === id);
        if (userCharacter) {
            return userCharacter;
        }
        
        // Check default characters
        const defaultCharacter = this.defaultCharacters.find(character => character.id === id);
        if (defaultCharacter) {
            return defaultCharacter;
        }
        
        return null;
    }

    /**
     * Create a new character
     * @param {Object} character - Character data
     * @returns {Promise} Promise that resolves with the created character
     */
    async createCharacter(character) {
        try {
            const currentUser = auth.getCurrentUser();
            
            // Create character object
            const newCharacter = {
                id: `char-${utils.generateId()}`,
                ...character,
                creator: currentUser?.uid || 'guest',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Add to user characters
            this.userData.characters.push(newCharacter);
            
            // Update stats
            this.userData.stats.charactersCreated = (this.userData.stats.charactersCreated || 0) + 1;
            
            // Save to storage
            await this.saveUserData();
            
            return newCharacter;
        } catch (error) {
            console.error('Error creating character:', error);
            throw error;
        }
    }

    /**
     * Update a character
     * @param {string} id - Character ID
     * @param {Object} updates - Character updates
     * @returns {Promise} Promise that resolves with the updated character
     */
    async updateCharacter(id, updates) {
        try {
            // Find character index
            const characterIndex = this.userData.characters.findIndex(character => character.id === id);
            
            if (characterIndex === -1) {
                throw new Error('Character not found');
            }
            
            // Update character
            const character = this.userData.characters[characterIndex];
            const updatedCharacter = {
                ...character,
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            // Replace in array
            this.userData.characters[characterIndex] = updatedCharacter;
            
            // Save to storage
            await this.saveUserData();
            
            return updatedCharacter;
        } catch (error) {
            console.error('Error updating character:', error);
            throw error;
        }
    }

    /**
     * Delete a character
     * @param {string} id - Character ID
     * @returns {Promise} Promise that resolves when deletion is complete
     */
    async deleteCharacter(id) {
        try {
            // Filter out character
            this.userData.characters = this.userData.characters.filter(character => character.id !== id);
            
            // Save to storage
            await this.saveUserData();
        } catch (error) {
            console.error('Error deleting character:', error);
            throw error;
        }
    }

    /**
     * Get all chats
     * @returns {Array} Array of chats
     */
    getChats() {
        return [...this.userData.chats];
    }

    /**
     * Get a chat by ID
     * @param {string} id - Chat ID
     * @returns {Object|null} Chat object or null if not found
     */
    getChat(id) {
        return this.userData.chats.find(chat => chat.id === id) || null;
    }

    /**
     * Create a new chat
     * @param {Object} chat - Chat data
     * @returns {Promise} Promise that resolves with the created chat
     */
    async createChat(chat) {
        try {
            // Get character
            const character = this.getCharacter(chat.characterId);
            
            if (!character) {
                throw new Error('Character not found');
            }
            
            // Create chat object
            const newChat = {
                id: `chat-${utils.generateId()}`,
                characterId: chat.characterId,
                characterName: character.name,
                characterAvatar: character.avatarUrl,
                messages: chat.messages || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                unread: false
            };
            
            // Add to chats
            this.userData.chats.push(newChat);
            
            // Update stats
            this.userData.stats.chatsCreated = (this.userData.stats.chatsCreated || 0) + 1;
            
            // Save to storage
            await this.saveUserData();
            
            return newChat;
        } catch (error) {
            console.error('Error creating chat:', error);
            throw error;
        }
    }

    /**
     * Add a message to a chat
     * @param {string} chatId - Chat ID
     * @param {Object} message - Message data
     * @returns {Promise} Promise that resolves with the updated chat
     */
    async addMessage(chatId, message) {
        try {
            // Find chat index
            const chatIndex = this.userData.chats.findIndex(chat => chat.id === chatId);
            
            if (chatIndex === -1) {
                throw new Error('Chat not found');
            }
            
            // Update chat
            const chat = this.userData.chats[chatIndex];
            
            // Add message
            const newMessage = {
                id: `msg-${utils.generateId()}`,
                ...message,
                timestamp: message.timestamp || new Date().toISOString()
            };
            
            chat.messages.push(newMessage);
            chat.updatedAt = new Date().toISOString();
            
            if (message.sender === 'character') {
                chat.unread = true;
            }
            
            // Update stats
            this.userData.stats.messagesSent = (this.userData.stats.messagesSent || 0) + 1;
            
            // Save to storage
            await this.saveUserData();
            
            // If message is from user, generate response
            if (message.sender === 'user') {
                await this.generateResponse(chatId);
            }
            
            return chat;
        } catch (error) {
            console.error('Error adding message:', error);
            throw error;
        }
    }

    /**
     * Generate AI response for a chat
     * @param {string} chatId - Chat ID
     * @returns {Promise} Promise that resolves with the updated chat
     */
    async generateResponse(chatId) {
        try {
            // Find chat
            const chat = this.getChat(chatId);
            
            if (!chat) {
                throw new Error('Chat not found');
            }
            
            // Get character
            const character = this.getCharacter(chat.characterId);
            
            if (!character) {
                throw new Error('Character not found');
            }
            
            // Get settings
            const settings = this.getUserSettings();
            
            // Apply API keys if available
            if (settings.openaiKey) {
                aiService.setApiKey('openai', settings.openaiKey);
            }
            
            if (settings.openrouterKey) {
                aiService.setApiKey('openrouter', settings.openrouterKey);
            }
            
            if (settings.huggingfaceKey) {
                aiService.setApiKey('huggingface', settings.huggingfaceKey);
            }
            
            // Check if we have necessary messages to generate a response
            if (!chat.messages || chat.messages.length === 0) {
                // Add greeting message if chat is empty
                const greeting = character.greeting || `Hello! I'm ${character.name}. How can I help you today?`;
                
                const greetingMessage = {
                    sender: 'character',
                    content: greeting,
                    timestamp: new Date().toISOString()
                };
                
                return await this.addMessage(chatId, greetingMessage);
            }
            
            // Get last user message
            const lastUserMessage = [...chat.messages].reverse().find(msg => msg.sender === 'user');
            
            if (!lastUserMessage) {
                return chat;
            }
            
            // Generate typing indicator system message
            const typingMessage = {
                sender: 'system',
                content: `${character.name} is typing...`,
                timestamp: new Date().toISOString(),
                isTyping: true
            };
            
            // Add typing indicator temporarily
            await this.addMessage(chatId, typingMessage);
            
            try {
                // Generate AI response
                // First try with AI service
                let responseContent = '';
                
                try {
                    // Default to Hugging Face if no specific model
                    const model = character.model || settings.defaultModel || 'hf/GPT-2';
                    
                    // Generation options
                    const options = {
                        model: model,
                        temperature: character.temperature || settings.temperature || 0.7,
                        maxTokens: character.maxTokens || settings.maxTokens || 150
                    };
                    
                    // Generate response
                    responseContent = await aiService.generateResponse(character, chat.messages, options);
                } catch (aiError) {
                    console.warn('AI service error, falling back to examples:', aiError);
                    
                    // Fallback to dialogue examples if AI service fails
                    const matchingExample = character.dialogueExamples.find(example => 
                        lastUserMessage.content.toLowerCase().includes(example.user.toLowerCase())
                    );
                    
                    if (matchingExample) {
                        responseContent = matchingExample.character;
                    } else {
                        // Generate generic response based on character
                        const genericResponses = [
                            `That's an interesting point! As ${character.name}, I'd say that relates to my perspective on ${character.tags[0] || 'this topic'}.`,
                            `I understand what you're saying. From my experience, I've found that ${character.personality.split('.')[0]}.`,
                            `That's a great question! Let me think... ${character.greeting}`,
                            `Interesting! I'd approach this by considering ${character.tags.slice(0, 2).join(' and ')}.`,
                            `Thanks for sharing that with me. As someone who is ${character.personality.split(',')[0]}, I appreciate your perspective.`
                        ];
                        
                        responseContent = genericResponses[Math.floor(Math.random() * genericResponses.length)];
                    }
                }
                
                // Remove typing indicator
                const updatedChat = await this.updateChat(chatId, {
                    messages: chat.messages.filter(msg => !msg.isTyping)
                });
                
                // Add response message
                const responseMessage = {
                    sender: 'character',
                    content: responseContent,
                    timestamp: new Date().toISOString()
                };
                
                return await this.addMessage(chatId, responseMessage);
            } catch (error) {
                // Remove typing indicator if there's an error
                await this.updateChat(chatId, {
                    messages: chat.messages.filter(msg => !msg.isTyping)
                });
                
                throw error;
            }
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }

    /**
     * Update a chat
     * @param {string} id - Chat ID
     * @param {Object} updates - Chat updates
     * @returns {Promise} Promise that resolves with the updated chat
     */
    async updateChat(id, updates) {
        try {
            // Find chat index
            const chatIndex = this.userData.chats.findIndex(chat => chat.id === id);
            
            if (chatIndex === -1) {
                throw new Error('Chat not found');
            }
            
            // Update chat
            const chat = this.userData.chats[chatIndex];
            const updatedChat = {
                ...chat,
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            // Replace in array
            this.userData.chats[chatIndex] = updatedChat;
            
            // Save to storage
            await this.saveUserData();
            
            return updatedChat;
        } catch (error) {
            console.error('Error updating chat:', error);
            throw error;
        }
    }

    /**
     * Delete a chat
     * @param {string} id - Chat ID
     * @returns {Promise} Promise that resolves when deletion is complete
     */
    async deleteChat(id) {
        try {
            // Filter out chat
            this.userData.chats = this.userData.chats.filter(chat => chat.id !== id);
            
            // Save to storage
            await this.saveUserData();
        } catch (error) {
            console.error('Error deleting chat:', error);
            throw error;
        }
    }

    /**
     * Delete all chats
     * @returns {Promise} Promise that resolves when deletion is complete
     */
    async deleteAllChats() {
        try {
            // Clear chats
            this.userData.chats = [];
            
            // Save to storage
            await this.saveUserData();
        } catch (error) {
            console.error('Error deleting all chats:', error);
            throw error;
        }
    }

    /**
     * Mark chat as read
     * @param {string} id - Chat ID
     * @returns {Promise} Promise that resolves with the updated chat
     */
    async markChatAsRead(id) {
        try {
            // Find chat
            const chat = this.getChat(id);
            
            if (!chat) {
                throw new Error('Chat not found');
            }
            
            // Update unread status
            chat.unread = false;
            
            // Save to storage
            await this.saveUserData();
            
            return chat;
        } catch (error) {
            console.error('Error marking chat as read:', error);
            throw error;
        }
    }

    /**
     * Get user profile
     * @returns {Object} User profile
     */
    getUserProfile() {
        return this.userData.profile || this.getDefaultProfile();
    }

    /**
     * Update user profile
     * @param {Object} updates - Profile updates
     * @returns {Promise} Promise that resolves with the updated profile
     */
    async updateUserProfile(updates) {
        try {
            // Update profile
            this.userData.profile = {
                ...this.userData.profile,
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            // Save to storage
            await this.saveUserData();
            
            return this.userData.profile;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    /**
     * Save user profile to storage
     */
    async saveUserProfile() {
        try {
            // Save to storage
            await this.saveUserData();
        } catch (error) {
            console.error('Error saving user profile:', error);
            throw error;
        }
    }

    /**
     * Get user settings
     * @returns {Object} User settings
     */
    getUserSettings() {
        return this.userData.settings || this.getDefaultSettings();
    }

    /**
     * Update user settings
     * @param {Object} updates - Settings updates
     * @returns {Promise} Promise that resolves with the updated settings
     */
    async updateUserSettings(updates) {
        try {
            // Update settings
            this.userData.settings = {
                ...this.userData.settings,
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            // Save to storage
            await this.saveUserData();
            
            return this.userData.settings;
        } catch (error) {
            console.error('Error updating user settings:', error);
            throw error;
        }
    }

    /**
     * Save user settings to storage
     */
    async saveUserSettings() {
        try {
            // Save to storage
            await this.saveUserData();
        } catch (error) {
            console.error('Error saving user settings:', error);
            throw error;
        }
    }

    /**
     * Export user data as JSON
     * @returns {string} JSON string of user data
     */
    exportData() {
        return JSON.stringify(this.userData, null, 2);
    }

    /**
     * Export chats as text
     * @returns {string} Text representation of chats
     */
    exportChatsAsText() {
        let output = '';
        
        this.userData.chats.forEach(chat => {
            output += `Chat with ${chat.characterName} (${new Date(chat.createdAt).toLocaleDateString()})\n\n`;
            
            chat.messages.forEach(message => {
                const sender = message.sender === 'character' ? chat.characterName : 'You';
                const time = new Date(message.timestamp).toLocaleTimeString();
                output += `[${time}] ${sender}: ${message.content}\n\n`;
            });
            
            output += '---------------------\n\n';
        });
        
        return output;
    }

    /**
     * Import data from JSON
     * @param {string} jsonString - JSON string of user data
     * @returns {Promise} Promise that resolves when import is complete
     */
    async importData(jsonString) {
        try {
            // Parse JSON
            const data = JSON.parse(jsonString);
            
            // Validate data
            if (!data.characters || !data.chats || !data.settings || !data.profile) {
                throw new Error('Invalid data format');
            }
            
            // Update user data
            this.userData = data;
            
            // Save to storage
            await this.saveUserData();
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    }

    /**
     * Get user statistics
     * @returns {Object} User statistics
     */
    getUserStats() {
        return this.userData.stats || this.getDefaultStats();
    }

    /**
     * Get default settings
     * @returns {Object} Default settings
     */
    getDefaultSettings() {
        return {
            theme: 'light',
            language: 'en',
            notifications: {
                enabled: true,
                sounds: true
            },
            privacy: {
                shareUsageData: false,
                allowNotifications: true,
                showOnlineStatus: true
            },
            appearance: {
                colorTheme: 'default',
                fontSize: 'medium',
                darkMode: false,
                animations: true,
                chatBackground: 'default'
            },
            chat: {
                typingDelay: 'realistic',
                messageLength: 'medium',
                tts: {
                    enabled: false,
                    voice: 'default',
                    speed: 1.0,
                    volume: 0.8
                },
                soundEffects: {
                    enabled: true,
                    volume: 0.5
                },
                swipeGestures: true,
                emojiSuggestions: true
            },
            ai: {
                defaultModel: 'gpt-2',
                temperature: 0.7,
                maxTokens: 1000,
                modelFallback: true,
                nsfw: false,
                safetyFilters: 'medium'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    /**
     * Get default profile
     * @returns {Object} Default profile
     */
    getDefaultProfile() {
        const currentUser = auth.getCurrentUser();
        
        return {
            name: currentUser?.displayName || 'Guest User',
            pronouns: '',
            bio: '',
            gender: '',
            birthDate: '',
            avatar: currentUser?.photoURL || null,
            interests: [],
            communicationStyle: 'casual',
            messageLength: 'medium',
            goals: '',
            topicsToAvoid: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    /**
     * Get default stats
     * @returns {Object} Default stats
     */
    getDefaultStats() {
        return {
            chatsCreated: 0,
            charactersCreated: 0,
            messagesSent: 0,
            timeSpent: 0,
            lastActive: new Date().toISOString()
        };
    }
}

// Export singleton instance
const dataStore = new DataStore();
export default dataStore;