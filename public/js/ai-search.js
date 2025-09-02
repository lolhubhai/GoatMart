
class AISearchEngine {
    constructor() {
        this.searchHistory = this.loadSearchHistory();
        this.aiSuggestions = new Map();
        this.trendingKeywords = [];
        this.init();
    }

    init() {
        this.loadTrendingKeywords();
        this.setupSmartSearch();
    }

    async loadTrendingKeywords() {
        try {
            const response = await fetch('/api/trending-keywords');
            this.trendingKeywords = await response.json();
        } catch (error) {
            this.trendingKeywords = ['music bot', 'auto reply', 'moderation', 'welcome message', 'fun commands'];
        }
    }

    setupSmartSearch() {
        // Smart autocomplete with fuzzy matching
        this.searchPatterns = {
            'music': ['music bot', 'spotify bot', 'youtube player', 'audio commands'],
            'mod': ['moderation bot', 'admin commands', 'ban system', 'kick commands'],
            'auto': ['auto reply', 'auto mod', 'auto welcome', 'automation'],
            'fun': ['fun commands', 'games', 'jokes', 'memes', 'entertainment'],
            'ai': ['ai chatbot', 'ai assistant', 'machine learning', 'smart replies'],
            'game': ['game commands', 'mini games', 'trivia', 'rpg system']
        };
    }

    generateSmartSuggestions(query) {
        const suggestions = [];
        const queryLower = query.toLowerCase();
        
        // Add trending suggestions
        this.trendingKeywords.forEach(keyword => {
            if (keyword.includes(queryLower) || queryLower.includes(keyword.split(' ')[0])) {
                suggestions.push({
                    type: 'trending',
                    text: keyword,
                    icon: '🔥',
                    description: 'Trending now'
                });
            }
        });

        // Add pattern-based suggestions
        Object.keys(this.searchPatterns).forEach(pattern => {
            if (queryLower.includes(pattern)) {
                this.searchPatterns[pattern].forEach(suggestion => {
                    suggestions.push({
                        type: 'smart',
                        text: suggestion,
                        icon: '🧠',
                        description: 'AI suggestion'
                    });
                });
            }
        });

        // Add recent searches
        this.searchHistory.slice(0, 3).forEach(search => {
            if (search.includes(queryLower)) {
                suggestions.push({
                    type: 'recent',
                    text: search,
                    icon: '🕒',
                    description: 'Recent search'
                });
            }
        });

        return suggestions.slice(0, 8); // Limit to 8 suggestions
    }

    saveSearch(query) {
        if (query && !this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            this.searchHistory = this.searchHistory.slice(0, 10); // Keep last 10
            localStorage.setItem('goatmart_search_history', JSON.stringify(this.searchHistory));
        }
    }

    loadSearchHistory() {
        try {
            return JSON.parse(localStorage.getItem('goatmart_search_history') || '[]');
        } catch {
            return [];
        }
    }

    // Fuzzy search algorithm
    fuzzyMatch(pattern, str) {
        pattern = pattern.toLowerCase();
        str = str.toLowerCase();
        
        let patternIdx = 0;
        let strIdx = 0;
        let score = 0;
        
        while (patternIdx < pattern.length && strIdx < str.length) {
            if (pattern[patternIdx] === str[strIdx]) {
                score += 1;
                patternIdx++;
            }
            strIdx++;
        }
        
        return patternIdx === pattern.length ? score / pattern.length : 0;
    }

    async performSemanticSearch(query) {
        // Simulate AI-powered semantic search
        const keywords = this.extractKeywords(query);
        const searchParams = new URLSearchParams({
            q: query,
            semantic: 'true',
            keywords: keywords.join(',')
        });
        
        try {
            const response = await fetch(`/api/search/semantic?${searchParams}`);
            return await response.json();
        } catch (error) {
            console.error('Semantic search failed:', error);
            return { items: [], suggestions: [] };
        }
    }

    extractKeywords(text) {
        const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        return text.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2 && !commonWords.includes(word))
            .slice(0, 5);
    }
}

// Voice search functionality
class VoiceSearch {
    constructor(searchInput) {
        this.searchInput = searchInput;
        this.recognition = null;
        this.isListening = false;
        this.setupVoiceRecognition();
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.showVoiceIndicator();
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.searchInput.value = transcript;
                this.searchInput.dispatchEvent(new Event('input'));
                this.hideVoiceIndicator();
            };

            this.recognition.onerror = () => {
                this.isListening = false;
                this.hideVoiceIndicator();
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.hideVoiceIndicator();
            };

            this.addVoiceButton();
        }
    }

    addVoiceButton() {
        const voiceBtn = document.createElement('button');
        voiceBtn.className = 'voice-search-btn';
        voiceBtn.innerHTML = '<i class="material-icons">mic</i>';
        voiceBtn.onclick = () => this.toggleVoiceSearch();
        
        const searchContainer = this.searchInput.parentElement;
        searchContainer.style.position = 'relative';
        searchContainer.appendChild(voiceBtn);
    }

    toggleVoiceSearch() {
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    showVoiceIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'voice-indicator';
        indicator.innerHTML = '🎤 Listening...';
        document.body.appendChild(indicator);
    }

    hideVoiceIndicator() {
        const indicator = document.querySelector('.voice-indicator');
        if (indicator) indicator.remove();
    }
}
