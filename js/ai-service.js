/**
 * AI Service for the AI Character Chat application
 * Handles communication with various AI model endpoints
 */

import utils from './utils.js';
import { t } from './translations.js';

class AIService {
    constructor() {
        this.defaultModel = 'hf/GPT-2'; // Default model if none specified
        this.models = {
            // Hugging Face models
            'hf/Tinny-Llama': 'https://lyon28-ai-character-chat.hf.space/inference/Tinny-Llama',
            'hf/Pythia': 'https://lyon28-ai-character-chat.hf.space/inference/Pythia',
            'hf/Bert-Tinny': 'https://lyon28-ai-character-chat.hf.space/inference/Bert-Tinny',
            'hf/Albert-Base-V2': 'https://lyon28-ai-character-chat.hf.space/inference/Albert-Base-V2',
            'hf/T5-Small': 'https://lyon28-ai-character-chat.hf.space/inference/T5-Small',
            'hf/GPT-2': 'https://lyon28-ai-character-chat.hf.space/inference/GPT-2',
            'hf/GPT-Neo': 'https://lyon28-ai-character-chat.hf.space/inference/GPT-Neo',
            'hf/Distilbert-Base-Uncased': 'https://lyon28-ai-character-chat.hf.space/inference/Distilbert-Base-Uncased',
            'hf/Distil_GPT-2': 'https://lyon28-ai-character-chat.hf.space/inference/Distil_GPT-2',
            'hf/GPT-2-Tinny': 'https://lyon28-ai-character-chat.hf.space/inference/GPT-2-Tinny',
            'hf/Electra-Small': 'https://lyon28-ai-character-chat.hf.space/inference/Electra-Small',
            
            // OpenAI models
            'openai/gpt-3.5-turbo': 'https://api.openai.com/v1/chat/completions',
            'openai/gpt-4': 'https://api.openai.com/v1/chat/completions',
            
            // OpenRouter models
            'openrouter/any': 'https://openrouter.ai/api/v1/chat/completions'
        };
        
        // Initialize API keys
        this.apiKeys = {
            openai: null,   // Will be populated from settings
            openrouter: null,  // Will be populated from settings
            huggingface: null  // Will be populated from settings
        };
    }
    
    /**
     * Set the API key for a specific service
     * @param {string} service - Service name (openai, openrouter, huggingface)
     * @param {string} key - API key
     */
    setApiKey(service, key) {
        if (service in this.apiKeys) {
            this.apiKeys[service] = key;
            return true;
        }
        return false;
    }
    
    /**
     * Get available model options for UI display
     * @returns {Array} Array of model options
     */
    getModelOptions() {
        return Object.keys(this.models).map(id => {
            const provider = id.split('/')[0];
            const model = id.split('/')[1];
            
            return {
                id,
                name: model,
                provider: provider.charAt(0).toUpperCase() + provider.slice(1) // Capitalize
            };
        });
    }
    
    /**
     * Generate a response from the character based on the chat history
     * @param {Object} character - Character data
     * @param {Array} messages - Array of message objects
     * @param {Object} options - Generation options
     * @returns {Promise<string>} Promise that resolves with the generated response
     */
    async generateResponse(character, messages, options = {}) {
        try {
            // Set default options
            const defaultOptions = {
                model: character.model || this.defaultModel,
                temperature: character.temperature || 0.7,
                maxTokens: character.maxTokens || 150,
                topP: character.topP || 0.9,
                presencePenalty: character.presencePenalty || 0.6,
                frequencyPenalty: character.frequencyPenalty || 0.6
            };
            
            // Merge default options with provided options
            const mergedOptions = { ...defaultOptions, ...options };
            
            // Prepare chat history and context
            const prompt = this.preparePrompt(character, messages);
            
            // Determine which service to use based on the model
            const [provider] = mergedOptions.model.split('/');
            
            let response;
            
            switch (provider) {
                case 'openai':
                    response = await this.callOpenAI(prompt, mergedOptions);
                    break;
                case 'openrouter':
                    response = await this.callOpenRouter(prompt, mergedOptions);
                    break;
                case 'hf':
                default:
                    response = await this.callHuggingFace(prompt, mergedOptions);
                    break;
            }
            
            return this.processResponse(response, character);
        } catch (error) {
            console.error('Error generating AI response:', error);
            throw new Error(t('ai_response_error'));
        }
    }
    
    /**
     * Prepare the prompt for the AI service
     * @param {Object} character - Character data
     * @param {Array} messages - Array of message objects
     * @returns {Object} Formatted prompt data
     */
    preparePrompt(character, messages) {
        // Prepare character information
        const characterInfo = `
            Name: ${character.name}
            Description: ${character.fullDescription || character.description}
            Personality: ${character.personality || 'Friendly and helpful'}
        `;
        
        // Extract dialogue examples
        const examples = character.dialogExamples || [];
        
        // Build system message
        const systemMessage = `You are ${character.name}. ${characterInfo}
        
        When responding, stay in character and follow these guidelines:
        1. Always respond as ${character.name}.
        2. Never break character or mention that you are an AI.
        3. Your responses should reflect ${character.name}'s personality and speech patterns.
        4. Keep responses concise, direct, and conversational.
        
        Here are some examples of how you should respond:`;
        
        // Format chat history
        const formattedMessages = [];
        
        // Add system message
        formattedMessages.push({
            role: 'system',
            content: systemMessage
        });
        
        // Add examples
        examples.forEach(example => {
            formattedMessages.push({
                role: 'user',
                content: example.user || example.userMessage
            });
            
            formattedMessages.push({
                role: 'assistant',
                content: example.assistant || example.characterMessage
            });
        });
        
        // Add conversation history
        messages.forEach(message => {
            if (message.sender === 'user') {
                formattedMessages.push({
                    role: 'user',
                    content: message.content
                });
            } else if (message.sender === 'character') {
                formattedMessages.push({
                    role: 'assistant',
                    content: message.content
                });
            }
        });
        
        return formattedMessages;
    }
    
    /**
     * Call OpenAI API to generate a response
     * @param {Array} messages - Formatted message array
     * @param {Object} options - Generation options
     * @returns {Promise<string>} Promise that resolves with the generated response
     */
    async callOpenAI(messages, options) {
        if (!this.apiKeys.openai) {
            throw new Error(t('openai_api_key_required'));
        }
        
        const modelName = options.model.split('/')[1];
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKeys.openai}`
            },
            body: JSON.stringify({
                model: modelName,
                messages,
                temperature: options.temperature,
                max_tokens: options.maxTokens,
                top_p: options.topP,
                presence_penalty: options.presencePenalty,
                frequency_penalty: options.frequencyPenalty,
                stream: false
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || t('openai_api_error'));
        }
        
        const data = await response.json();
        return data.choices[0].message.content.trim();
    }
    
    /**
     * Call OpenRouter API to generate a response
     * @param {Array} messages - Formatted message array
     * @param {Object} options - Generation options
     * @returns {Promise<string>} Promise that resolves with the generated response
     */
    async callOpenRouter(messages, options) {
        if (!this.apiKeys.openrouter) {
            throw new Error(t('openrouter_api_key_required'));
        }
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKeys.openrouter}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'AI Character Chat'
            },
            body: JSON.stringify({
                model: options.specificModel || 'openai/gpt-3.5-turbo',
                messages,
                temperature: options.temperature,
                max_tokens: options.maxTokens,
                top_p: options.topP,
                presence_penalty: options.presencePenalty,
                frequency_penalty: options.frequencyPenalty,
                stream: false
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || t('openrouter_api_error'));
        }
        
        const data = await response.json();
        return data.choices[0].message.content.trim();
    }
    
    /**
     * Call Hugging Face API to generate a response
     * @param {Array} messages - Formatted message array
     * @param {Object} options - Generation options
     * @returns {Promise<string>} Promise that resolves with the generated response
     */
    async callHuggingFace(messages, options) {
        const model = options.model.split('/')[1];
        const endpoint = this.models[options.model];
        
        if (!endpoint) {
            throw new Error(t('invalid_model'));
        }
        
        // Format prompt for Hugging Face models
        // For these models, we'll simplify the prompt structure
        const lastUserMessage = messages[messages.length - 1].content;
        
        // Basic context includes character name and description
        let context = '';
        
        // Find the system message
        const systemMessage = messages.find(m => m.role === 'system');
        if (systemMessage) {
            context = systemMessage.content;
        }
        
        // Add recent conversation history (last few exchanges)
        const recentMessages = messages.slice(-6); // Take last 6 messages or fewer
        const conversationHistory = recentMessages
            .filter(m => m.role !== 'system')
            .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
            .join('\n');
        
        // Complete prompt
        const prompt = `${context}\n\nConversation:\n${conversationHistory}\n\nUser: ${lastUserMessage}\n\nAssistant:`;
        
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Add API key if available
            if (this.apiKeys.huggingface) {
                headers['Authorization'] = `Bearer ${this.apiKeys.huggingface}`;
            }
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        temperature: options.temperature,
                        max_new_tokens: options.maxTokens,
                        top_p: options.topP,
                        do_sample: true
                    }
                })
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || t('huggingface_api_error'));
            }
            
            const data = await response.json();
            
            // Handle different response formats
            let generatedText = '';
            
            if (Array.isArray(data) && data[0].generated_text) {
                generatedText = data[0].generated_text;
            } else if (data.generated_text) {
                generatedText = data.generated_text;
            } else if (typeof data === 'string') {
                generatedText = data;
            } else {
                console.warn('Unexpected HF response format:', data);
                generatedText = 'I apologize, but I am having trouble understanding at the moment.';
            }
            
            // Extract only the assistant's response from the returned text
            // Look for "Assistant:" in the text and take what follows
            if (generatedText.includes('Assistant:')) {
                const parts = generatedText.split('Assistant:');
                generatedText = parts[parts.length - 1].trim();
            }
            
            // If there's a subsequent "User:" part, we need to trim that off
            if (generatedText.includes('User:')) {
                generatedText = generatedText.split('User:')[0].trim();
            }
            
            return generatedText;
        } catch (error) {
            console.error('Hugging Face API error:', error);
            throw new Error(t('huggingface_api_error'));
        }
    }
    
    /**
     * Process the AI response
     * @param {string} response - Raw response from the AI service
     * @param {Object} character - Character data
     * @returns {string} Processed response
     */
    processResponse(response, character) {
        if (!response) {
            return 'I seem to be having trouble responding right now.';
        }
        
        // Replace placeholders
        let processedResponse = response.replace(/\{character\}/g, character.name);
        
        // If the response is too long, truncate it
        const maxResponseLength = 1000;
        if (processedResponse.length > maxResponseLength) {
            // Try to truncate at the end of a sentence
            const truncatedIndex = processedResponse.lastIndexOf('.', maxResponseLength);
            if (truncatedIndex > 0) {
                processedResponse = processedResponse.substring(0, truncatedIndex + 1);
            } else {
                processedResponse = processedResponse.substring(0, maxResponseLength) + '...';
            }
        }
        
        return processedResponse;
    }
}

// Create and export a singleton instance
const aiService = new AIService();
export default aiService;