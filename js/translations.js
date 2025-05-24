/**
 * Translations functionality for the AI Character Chat application
 */

// Default language
let currentLanguage = 'en';

// Translation dictionary
const translations = {
    en: {
        // Common
        'app_name': 'AI Character Chat',
        'loading': 'Loading...',
        'save': 'Save',
        'cancel': 'Cancel',
        'delete': 'Delete',
        'edit': 'Edit',
        'close': 'Close',
        'confirm': 'Confirm',
        'error': 'Error',
        'success': 'Success',
        'warning': 'Warning',
        'info': 'Information',
        
        // Auth
        'sign_in': 'Sign In',
        'sign_up': 'Sign Up',
        'sign_out': 'Sign Out',
        'email': 'Email',
        'password': 'Password',
        'confirm_password': 'Confirm Password',
        'forgot_password': 'Forgot Password?',
        'no_account': 'Don\'t have an account?',
        'already_account': 'Already have an account?',
        'continue_as_guest': 'Continue as Guest',
        'invalid_credentials': 'Invalid email or password',
        'password_mismatch': 'Passwords do not match',
        
        // Navigation
        'home': 'Home',
        'chats': 'Chats',
        'characters': 'Characters',
        'profile': 'Profile',
        'settings': 'Settings',
        
        // Characters
        'character_creation': 'Character Creation',
        'character_edit': 'Edit Character',
        'character_details': 'Character Details',
        'character_name': 'Character Name',
        'character_description': 'Description',
        'character_personality': 'Personality',
        'character_categories': 'Categories',
        'character_tags': 'Tags',
        'character_voice': 'Voice & Speech Style',
        'character_scenario': 'Scenario / World',
        'character_greeting': 'Greeting Message',
        'character_dialogue_examples': 'Dialogue Examples',
        'add_dialogue_example': 'Add Example',
        'no_characters_found': 'No Characters Found',
        'create_character': 'Create Character',
        'browse_characters': 'Browse Characters',
        
        // Chat
        'new_chat': 'New Chat',
        'type_message': 'Type a message...',
        'send_message': 'Send',
        'clear_chat': 'Clear Chat',
        'chat_cleared': 'Chat cleared',
        'chat_with': 'Chat with',
        'chat_settings': 'Chat Settings',
        'typing': 'typing...',
        'thinking': 'thinking...',
        'no_chats_found': 'No Chats Found',
        'start_new_chat': 'Start a New Chat',
        
        // Profile
        'your_name': 'Your Name',
        'your_bio': 'About You',
        'your_preferences': 'Your Preferences',
        'communication_style': 'Communication Style',
        'casual': 'Casual',
        'formal': 'Formal',
        'friendly': 'Friendly',
        'professional': 'Professional',
        'message_length': 'Message Length',
        'short': 'Short',
        'medium': 'Medium',
        'long': 'Long',
        'your_interests': 'Your Interests',
        'add_interest': 'Add an interest',
        'privacy_settings': 'Privacy Settings',
        'account_settings': 'Account Settings',
        
        // Settings
        'appearance': 'Appearance',
        'theme': 'Theme',
        'dark_mode': 'Dark Mode',
        'language': 'Language',
        'notifications': 'Notifications',
        'sound_effects': 'Sound Effects',
        'text_to_speech': 'Text to Speech',
        'voice_input': 'Voice Input',
        'data_usage': 'Data Usage',
        'export_data': 'Export Data',
        'import_data': 'Import Data',
        'reset_data': 'Reset Data',
        'api_keys': 'API Keys',
        'advanced_settings': 'Advanced Settings',
        
        // Errors
        'error_loading_data': 'Error loading data',
        'error_saving_data': 'Error saving data',
        'error_network': 'Network error, please try again',
        'error_api': 'API error, please try again',
        'error_default': 'Something went wrong, please try again'
    },
    
    // Example of additional language (Indonesian)
    id: {
        // Common
        'app_name': 'AI Character Chat',
        'loading': 'Memuat...',
        'save': 'Simpan',
        'cancel': 'Batal',
        'delete': 'Hapus',
        'edit': 'Edit',
        'close': 'Tutup',
        'confirm': 'Konfirmasi',
        'error': 'Kesalahan',
        'success': 'Berhasil',
        'warning': 'Peringatan',
        'info': 'Informasi',
        
        // Auth
        'sign_in': 'Masuk',
        'sign_up': 'Daftar',
        'sign_out': 'Keluar',
        'email': 'Email',
        'password': 'Kata Sandi',
        'confirm_password': 'Konfirmasi Kata Sandi',
        'forgot_password': 'Lupa Kata Sandi?',
        'no_account': 'Belum punya akun?',
        'already_account': 'Sudah punya akun?',
        'continue_as_guest': 'Lanjutkan sebagai Tamu',
        'invalid_credentials': 'Email atau kata sandi tidak valid',
        'password_mismatch': 'Kata sandi tidak cocok',
        
        // Navigation
        'home': 'Beranda',
        'chats': 'Obrolan',
        'characters': 'Karakter',
        'profile': 'Profil',
        'settings': 'Pengaturan',
        
        // Characters
        'character_creation': 'Buat Karakter',
        'character_edit': 'Edit Karakter',
        'character_details': 'Detail Karakter',
        'character_name': 'Nama Karakter',
        'character_description': 'Deskripsi',
        'character_personality': 'Kepribadian',
        'character_categories': 'Kategori',
        'character_tags': 'Tag',
        'character_voice': 'Gaya Suara & Berbicara',
        'character_scenario': 'Skenario / Dunia',
        'character_greeting': 'Pesan Sambutan',
        'character_dialogue_examples': 'Contoh Dialog',
        'add_dialogue_example': 'Tambah Contoh',
        'no_characters_found': 'Tidak Ada Karakter Ditemukan',
        'create_character': 'Buat Karakter',
        'browse_characters': 'Jelajahi Karakter',
        
        // Chat
        'new_chat': 'Obrolan Baru',
        'type_message': 'Ketik pesan...',
        'send_message': 'Kirim',
        'clear_chat': 'Hapus Obrolan',
        'chat_cleared': 'Obrolan dihapus',
        'chat_with': 'Mengobrol dengan',
        'chat_settings': 'Pengaturan Obrolan',
        'typing': 'mengetik...',
        'thinking': 'berpikir...',
        'no_chats_found': 'Tidak Ada Obrolan Ditemukan',
        'start_new_chat': 'Mulai Obrolan Baru',
        
        // Profile
        'your_name': 'Nama Anda',
        'your_bio': 'Tentang Anda',
        'your_preferences': 'Preferensi Anda',
        'communication_style': 'Gaya Komunikasi',
        'casual': 'Santai',
        'formal': 'Formal',
        'friendly': 'Ramah',
        'professional': 'Profesional',
        'message_length': 'Panjang Pesan',
        'short': 'Pendek',
        'medium': 'Sedang',
        'long': 'Panjang',
        'your_interests': 'Minat Anda',
        'add_interest': 'Tambahkan minat',
        'privacy_settings': 'Pengaturan Privasi',
        'account_settings': 'Pengaturan Akun',
        
        // Settings
        'appearance': 'Tampilan',
        'theme': 'Tema',
        'dark_mode': 'Mode Gelap',
        'language': 'Bahasa',
        'notifications': 'Notifikasi',
        'sound_effects': 'Efek Suara',
        'text_to_speech': 'Teks ke Suara',
        'voice_input': 'Input Suara',
        'data_usage': 'Penggunaan Data',
        'export_data': 'Ekspor Data',
        'import_data': 'Impor Data',
        'reset_data': 'Reset Data',
        'api_keys': 'Kunci API',
        'advanced_settings': 'Pengaturan Lanjutan',
        
        // Errors
        'error_loading_data': 'Kesalahan memuat data',
        'error_saving_data': 'Kesalahan menyimpan data',
        'error_network': 'Kesalahan jaringan, silakan coba lagi',
        'error_api': 'Kesalahan API, silakan coba lagi',
        'error_default': 'Terjadi kesalahan, silakan coba lagi'
    }
};

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @param {Object} params - Parameters to inject into the translation
 * @returns {string} Translated string
 */
function t(key, params = {}) {
    // Get translation dictionary for current language
    const dict = translations[currentLanguage] || translations.en;
    
    // Get translation for key or fall back to English or the key itself
    let translated = dict[key] || translations.en[key] || key;
    
    // Replace parameters
    if (params) {
        Object.keys(params).forEach(paramKey => {
            translated = translated.replace(`{${paramKey}}`, params[paramKey]);
        });
    }
    
    return translated;
}

/**
 * Set current language
 * @param {string} lang - Language code (e.g. 'en', 'id')
 */
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        
        // Dispatch event for language change
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }
}

/**
 * Get current language
 * @returns {string} Current language code
 */
function getLanguage() {
    return currentLanguage;
}

/**
 * Initialize language from storage or browser
 */
function initLanguage() {
    // Try to get from localStorage
    const storedLang = localStorage.getItem('language');
    
    if (storedLang && translations[storedLang]) {
        currentLanguage = storedLang;
    } else {
        // Try to get from browser
        const browserLang = navigator.language?.split('-')[0];
        
        if (browserLang && translations[browserLang]) {
            currentLanguage = browserLang;
            localStorage.setItem('language', browserLang);
        }
    }
}

/**
 * Get available languages
 * @returns {Object} Object with language codes as keys and names as values
 */
function getAvailableLanguages() {
    return {
        en: 'English',
        id: 'Bahasa Indonesia'
    };
}

// Initialize language
initLanguage();

// Export functions
export { t, setLanguage, getLanguage, getAvailableLanguages };