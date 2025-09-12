// Main JavaScript file for GoatMart with Android UI integration
class GoatMartApp {
    constructor() {
        this.currentSearch = '';
        this.currentType = 'all';
        this.isLoading = false;
        this.currentCursor = null;
        this.hasMore = true;
        this.loadedIds = new Set();
        this.observer = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.setupServiceWorker();
    }

    setupEventListeners() {
        // Theme toggle
        document.addEventListener('DOMContentLoaded', () => {
            this.detectColorScheme();
            this.setupThemeToggle();
            this.loadStats();
            this.loadCommands('', 'all', true);
            this.setupSearchAndFilters();
        });

        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showNotification('An error occurred. Please try again.', 'error');
        });

        // Online/offline status
        window.addEventListener('online', () => {
            this.showNotification('Back online! 🌐', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('You are offline 📱', 'warning');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Button ripple effects
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', this.createRipple);
        });

        // Card hover effects
        document.querySelectorAll('.command-card').forEach(card => {
            card.addEventListener('mouseenter', this.handleCardHover);
            card.addEventListener('mouseleave', this.handleCardLeave);
        });

        // Form enhancements
        this.setupFormEnhancements();
    }


    setupAdvancedFilters() {
        const filterContainer = document.getElementById('filterContainer');
        if (filterContainer) {
            filterContainer.addEventListener('click', (e) => {
                const target = e.target.closest('.filter-button');
                if (target) {
                    const filterType = target.dataset.filter;
                    console.log('Applying filter:', filterType);
                    this.applyFilter(filterType);
                }
            });
        }
    }

    applyFilter(type) {
        this.currentType = type;
        this.loadCommands(this.currentSearch, type, true);
    }

    async performAdvancedSearch(query) {
        // Simulate fetching AI suggestions
        console.log('Performing advanced search for:', query);
        // In a real app, you'd fetch suggestions from an API
        const suggestions = [
            `AI suggestion for ${query} 1`,
            `AI suggestion for ${query} 2`,
            `AI suggestion for ${query} 3`
        ];
        this.updateSearchSuggestions(suggestions);
    }

    createSearchSuggestions(input) {
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'searchSuggestions';
        suggestionsContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--surface);
            border: 1px solid var(--outline);
            border-top: none;
            border-radius: 0 0 12px 12px;
            z-index: 1001;
            max-height: 300px;
            overflow-y: auto;
            box-shadow: var(--shadow-lg);
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s ease, visibility 0.2s ease;
        `;
        input.parentNode.style.position = 'relative';
        input.parentNode.appendChild(suggestionsContainer);
    }

    showSearchSuggestions(query) {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.opacity = '1';
            suggestionsContainer.style.visibility = 'visible';
        }
    }

    hideSearchSuggestions() {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.opacity = '0';
            suggestionsContainer.style.visibility = 'hidden';
        }
    }

    updateSearchSuggestions(suggestions) {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (!suggestionsContainer) return;

        suggestionsContainer.innerHTML = '';
        if (suggestions.length === 0) {
            suggestionsContainer.innerHTML = '<div class="suggestion-item">No suggestions found.</div>';
            return;
        }

        suggestions.forEach(suggestion => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = suggestion;
            div.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                transition: background 0.2s ease;
                border-bottom: 1px solid var(--outline);
                color: var(--on-surface);
            `;
            div.addEventListener('mouseenter', () => div.style.background = 'var(--surface-variant)');
            div.addEventListener('mouseleave', () => div.style.background = 'var(--surface)');
            div.addEventListener('click', () => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.value = suggestion;
                    this.hideSearchSuggestions();
                    this.currentSearch = suggestion;
                    this.loadCommands(this.currentSearch, this.currentType, true);
                }
            });
            suggestionsContainer.appendChild(div);
        });
    }

    showRecentSearches() {
        // Placeholder for showing recent searches
        console.log('Showing recent searches...');
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (!suggestionsContainer) return;

        const recentSearches = ['react', 'javascript', 'css']; // Example
        suggestionsContainer.innerHTML = '';
        recentSearches.forEach(search => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = search;
            div.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                transition: background 0.2s ease;
                border-bottom: 1px solid var(--outline);
                color: var(--on-surface);
            `;
            div.addEventListener('mouseenter', () => div.style.background = 'var(--surface-variant)');
            div.addEventListener('mouseleave', () => div.style.background = 'var(--surface)');
            div.addEventListener('click', () => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.value = search;
                    this.hideSearchSuggestions();
                    this.currentSearch = search;
                    this.loadCommands(this.currentSearch, this.currentType, true);
                }
            });
            suggestionsContainer.appendChild(div);
        });
        suggestionsContainer.style.opacity = '1';
        suggestionsContainer.style.visibility = 'visible';
    }

    setupVoiceSearch(inputElement) {
        if ('webkitSpeechRecognition' in window) {
            const micButton = document.createElement('button');
            micButton.innerHTML = '<i class="material-icons">mic</i>';
            micButton.className = 'btn btn-text voice-search-button';
            micButton.style.cssText = `
                margin-left: -30px; /* Adjust to overlap search input */
                z-index: 1;
                padding: 8px;
                border-radius: 50%;
            `;
            inputElement.parentNode.style.display = 'flex';
            inputElement.parentNode.style.alignItems = 'center';
            inputElement.parentNode.appendChild(micButton);

            const recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.interimResults = true;

            micButton.addEventListener('click', () => {
                recognition.start();
                micButton.querySelector('i').textContent = 'record_voice_over';
                micButton.style.color = 'var(--error)';
            });

            recognition.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    interimTranscript += event.results[i][0].transcript;
                }
                inputElement.value = interimTranscript;
                this.currentSearch = interimTranscript;
                this.loadCommands(this.currentSearch, this.currentType, true);
            };

            recognition.onend = () => {
                micButton.querySelector('i').textContent = 'mic';
                micButton.style.color = 'var(--on-surface-variant)';
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                micButton.querySelector('i').textContent = 'mic';
                micButton.style.color = 'var(--on-surface-variant)';
            };
        } else {
            console.log('Web Speech API not supported by this browser.');
        }
    }


    // Corrected search and filter setup
    setupSearchAndFilters() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            // Remove any existing debounced handler to avoid duplicates
            if (this.searchHandler) {
                searchInput.removeEventListener('input', this.searchHandler);
            }

            // Debounce the search input handler
            this.searchHandler = this.debounce(() => {
                const searchValue = searchInput.value.trim();
                this.currentSearch = searchValue;
                console.log('Searching for:', searchValue);
                this.loadCommands(this.currentSearch, this.currentType, true);
            }, 300);

            searchInput.addEventListener('input', this.searchHandler);

            // Add visual feedback for focus
            searchInput.addEventListener('focus', () => {
                const parent = searchInput.parentElement;
                if (parent) {
                    parent.style.borderColor = 'var(--primary)';
                    parent.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.2)';
                }
            });

            searchInput.addEventListener('blur', () => {
                const parent = searchInput.parentElement;
                if (parent) {
                    parent.style.borderColor = ''; // Reset to default
                    parent.style.boxShadow = '';   // Reset to default
                }
            });
        }

        // Quick access functionality
        const quickAccessInput = document.getElementById('quickAccessInput');
        const quickAccessBtn = document.getElementById('quickAccessBtn');

        if (quickAccessInput && quickAccessBtn) {
            const handleQuickAccess = () => {
                const sequentialId = parseInt(quickAccessInput.value);
                if (sequentialId && sequentialId > 0) {
                    // Use clean URL format
                    window.location.href = `/view?id=${sequentialId}`;
                } else {
                    this.showToast('Please enter a valid command ID', 'error');
                }
            };

            quickAccessBtn.addEventListener('click', handleQuickAccess);

            quickAccessInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleQuickAccess();
                }
            });
        }

        // Filter chips
        const chips = document.querySelectorAll('.chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.currentType = chip.dataset.type;
                console.log('Filter changed to:', this.currentType);
                this.loadCommands(this.currentSearch, this.currentType, true);
            });
        });
    }

    initializeComponents() {
        // Initialize tooltips
        this.initTooltips();

        // Initialize lazy loading
        this.initLazyLoading();

        // Initialize intersection observers
        this.initScrollAnimations();

        // Initialize touch gestures for mobile
        this.initTouchGestures();
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        }
    }

    detectColorScheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        this.applyTheme(prefersDark.matches ? 'dark' : 'light');

        prefersDark.addEventListener('change', (e) => {
            this.applyTheme(e.matches ? 'dark' : 'light');
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                this.applyTheme(newTheme);
                localStorage.setItem('theme', newTheme);
            });
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        // Update theme color meta tag for Android
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.content = theme === 'dark' ? '#121212' : '#6366f1';
        }
    }

    initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.getAttribute('data-tooltip'));
            });

            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: #323232;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            z-index: 1002;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        tooltip.style.left = `${rect.left + (rect.width - tooltipRect.width) / 2}px`;
        tooltip.style.top = `${rect.top - tooltipRect.height - 8}px`;

        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 10);

        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.style.opacity = '0';
            setTimeout(() => {
                if (this.currentTooltip && this.currentTooltip.parentNode) {
                    this.currentTooltip.parentNode.removeChild(this.currentTooltip);
                }
                this.currentTooltip = null;
            }, 200);
        }
    }

    initLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    initTouchGestures() {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', () => {
            const diffX = startX - currentX;
            const diffY = startY - currentY;

            // Detect swipe gestures
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > 50) {
                    if (diffX > 0) {
                        this.handleSwipeLeft();
                    } else {
                        this.handleSwipeRight();
                    }
                }
            }
        }, { passive: true });
    }

    handleSwipeLeft() {
        console.log('Swipe left detected');
    }

    handleSwipeRight() {
        console.log('Swipe right detected');
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
            }
        }

        // Escape to clear search
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput === document.activeElement) {
                searchInput.value = '';
                searchInput.blur();
            }
        }
    }

    createRipple(e) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
        `;

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 600);
    }

    handleCardHover(e) {
        const card = e.currentTarget;
        card.style.transform = 'translateY(-8px) scale(1.02)';
        card.style.boxShadow = 'var(--shadow-xl)';
    }

    handleCardLeave(e) {
        const card = e.currentTarget;
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = 'var(--shadow-md)';
    }

    setupFormEnhancements() {
        // Floating labels
        document.querySelectorAll('.form-floating input, .form-floating textarea').forEach(input => {
          input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
          });

          input.addEventListener('blur', () => {
            if (!input.value) {
              input.parentElement.classList.remove('focused');
            }
          });

          // Check if input has value on load
          if (input.value) {
            input.parentElement.classList.add('focused');
          }
        });
    }

    async loadStats() {
        try {
          const response = await fetch('/api/stats');
          const stats = await response.json();

          this.updateStatCounters(stats);
        } catch (error) {
          console.error('Error loading stats:', error);
        }
    }

    updateStatCounters(stats) {
        const counters = {
          'totalCommands': stats.totalCommands || 0,
          'totalLikes': stats.totalLikes || 0,
          'activeUsers': stats.dailyActiveUsers || 0,
          'totalShares': stats.totalShares || 0,
          'heroCommands': stats.totalCommands || 0,
          'heroLikes': stats.totalLikes || 0,
          'heroUsers': stats.dailyActiveUsers || 0
        };

        Object.entries(counters).forEach(([id, value]) => {
          const element = document.getElementById(id);
          if (element) {
            this.animateCounter(element, 0, value, 2000);
          }
        });
    }

    animateCounter(element, start, end, duration) {
        const startTime = performance.now();
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const current = Math.floor(start + (end - start) * easeOutQuart);

          element.textContent = current.toLocaleString();

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
    }

    async loadCommands(search = '', type = 'all', reset = false) {
        if (this.isLoading) return;
        
        if (reset) {
            this.currentSearch = search?.trim() || '';
            this.currentType = type || 'all';
            this.currentCursor = null;
            this.hasMore = true;
            this.loadedIds.clear();
            this.clearCommandsUI();
            this.setupInfiniteScroll();
        }
        
        if (!this.hasMore) return;
        
        this.isLoading = true;
        
        try {
            const params = new URLSearchParams();
            if (this.currentSearch) params.append('search', this.currentSearch);
            if (this.currentType !== 'all') params.append('category', this.currentType);
            params.append('limit', '50');
            if (this.currentCursor) params.append('cursor', this.currentCursor);
            
            const res = await fetch(`/api/items?${params}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            
            const data = await res.json();
            const items = data.items || [];
            
            if (reset && items.length === 0) {
                const container = document.getElementById('commandsContainer');
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 64px 16px; color: var(--on-surface); opacity: 0.7;">
                        <i class="material-icons" style="font-size: 64px; margin-bottom: 16px;">search_off</i>
                        <h3 style="margin-bottom: 8px; font-weight: 400;">No commands found</h3>
                        <p>Try adjusting your search terms or filters</p>
                    </div>
                    <div id="infiniteSentinel" style="grid-column: 1 / -1; height: 1px;"></div>
                `;
                this.hasMore = false;
                return;
            }
            
            for (const item of items) {
                const key = item.shortId || item.itemID;
                if (this.loadedIds.has(key)) continue;
                this.loadedIds.add(key);
                this.appendCommandCard(item);
            }
            
            this.currentCursor = data.nextCursor || null;
            this.hasMore = !!data.hasMore;
            
            if (!this.hasMore) {
                this.showEndOfList();
            }
            
            if (this.updateCommandCount) {
                this.updateCommandCount(this.loadedIds.size, data.total ?? this.loadedIds.size);
            }
            
        } catch (e) {
            console.error('Error loading commands:', e);
            this.showFetchError(e);
        } finally {
            this.isLoading = false;
        }
    }


    updateCommandCount(showing, total) {
        // Update header with command count
        const countElement = document.getElementById('commandCount');
        if (countElement) {
            countElement.textContent = showing === total 
                ? `Showing all ${total} commands`
                : `Showing ${showing} of ${total} commands`;
        }
    }

    clearCommandsUI() {
        const container = document.getElementById('commandsContainer');
        container.innerHTML = '<div id="infiniteSentinel" style="grid-column: 1 / -1; height: 1px;"></div>';
    }

    appendCommandCard(item) {
        const key = item.shortId || item.itemID;
        if (this.loadedIds.has(key)) return;
        this.loadedIds.add(key);
        
        const container = document.getElementById('commandsContainer');
        const sentinel = document.getElementById('infiniteSentinel');
        const cardHTML = this.createCommandCard(item);
        
        const cardElement = document.createElement('div');
        cardElement.innerHTML = cardHTML;
        container.insertBefore(cardElement.firstElementChild, sentinel);
        
        this.attachCardEventListeners();
    }

    setupInfiniteScroll() {
        if (this.observer) this.observer.disconnect();
        
        const sentinel = document.getElementById('infiniteSentinel');
        if (!sentinel) return;
        
        this.observer = new IntersectionObserver((entries) => {
            if (entries.some(e => e.isIntersecting) && this.hasMore && !this.isLoading) {
                this.loadCommands(this.currentSearch, this.currentType, false);
            }
        }, { root: null, rootMargin: '600px', threshold: 0 });
        
        this.observer.observe(sentinel);
    }

    showEndOfList() {
        const container = document.getElementById('commandsContainer');
        const sentinel = document.getElementById('infiniteSentinel');
        if (sentinel) {
            sentinel.innerHTML = '<div style="text-align: center; padding: 32px; color: var(--on-surface); opacity: 0.7;"><i class="material-icons" style="font-size: 24px; margin-bottom: 8px;">done_all</i><p>You\'ve reached the end! 🎉</p></div>';
        }
    }

    showFetchError(err) {
        console.error('Error loading commands:', err);
        const container = document.getElementById('commandsContainer');
        const sentinel = document.getElementById('infiniteSentinel');
        if (sentinel) {
            sentinel.innerHTML = '<div style="text-align: center; padding: 32px; color: var(--error);"><i class="material-icons" style="font-size: 48px; margin-bottom: 16px;">error</i><h3>Error loading commands</h3><button class="btn btn-contained" onclick="window.app.loadCommands()">Try Again</button></div>';
        }
    }

    attachCardEventListeners() {
        // Re-attach hover effects to new cards
        document.querySelectorAll('.command-card').forEach(card => {
            card.addEventListener('mouseenter', this.handleCardHover);
            card.addEventListener('mouseleave', this.handleCardLeave);
        });

        // Re-attach button ripple effects
        document.querySelectorAll('.btn').forEach(button => {
            button.removeEventListener('click', this.createRipple);
            button.addEventListener('click', this.createRipple);
        });
    }



    createCommandCard(command) {
        const truncateDescription = (text, maxLength = 120) => {
            return text && text.length > maxLength ? text.substring(0, maxLength) + '...' : (text || 'No description available');
        };

        return `
            <div class="command-card">
                <div class="command-header">
                    <div class="command-title">${this.escapeHtml(command.itemName)}</div>
                    <div class="command-author">by ${this.escapeHtml(command.authorName)}</div>
                    <div class="command-id-badge">#${command.sequentialId || command.itemID}</div>
                </div>
                <div class="command-body">
                    <div class="command-description">
                        ${this.escapeHtml(truncateDescription(command.description))}
                    </div>
                    <div class="command-tags">
                        <span class="tag">${command.type}</span>
                        ${command.tags ? command.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('') : ''}
                    </div>
                    <div class="command-actions">
                        <a href="/view?id=${command.shortId || command.itemID}" class="btn btn-contained" style="flex: 1;">
                            <i class="material-icons" style="font-size: 18px;">visibility</i>
                            View
                        </a>
                        <button class="btn btn-outlined" onclick="window.app.likeCommand(${command.itemID})">
                            <i class="material-icons" style="font-size: 18px;">favorite</i>
                            ${command.likes || 0}
                        </button>
                        <button class="btn btn-text" onclick="window.app.showQuickAccess(${command.sequentialId || command.itemID}, '${command.shortId}')" title="Quick Access">
                            <i class="material-icons" style="font-size: 18px;">link</i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async likeCommand(itemID) {
        try {
            const response = await fetch(`/api/items/${itemID}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            if (result.success) {
                // Update like count in UI without reloading all commands
                const likeButton = document.querySelector(`button[onclick*="likeCommand(${itemID})"]`);
                if (likeButton) {
                    const likeText = likeButton.querySelector('i').nextSibling;
                    if (likeText) {
                        likeText.textContent = ` ${result.likes || 0}`;
                    }
                }

                // Show success snackbar
                this.showToast('Command liked! ❤️');
            }
        } catch (error) {
            console.error('Error liking command:', error);
            this.showToast('Error liking command', 'error');
        }
    }

    showToast(message, type = 'info') {
        this.showFallbackNotification(message, type, 4000);
    }

    showFallbackNotification(message, type, duration) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 16px;
            right: 16px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1003;
            transform: translateY(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            max-width: 400px;
            margin: 0 auto;
            text-align: center;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateY(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    showNotification(message, type) {
        this.showFallbackNotification(message, type, 4000);
    }

    // Utility functions
    static formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    static formatDate(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    showQuickAccess(sequentialId, shortId) {
        const modal = document.createElement('div');
        modal.className = 'quick-access-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Quick Access Links</h3>
                    <button class="btn btn-text" onclick="this.closest('.quick-access-modal').remove()">
                        <i class="material-icons">close</i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="access-item">
                        <label>Sequential ID Access:</label>
                        <div class="access-links">
                            <code>/view?id=${sequentialId}</code>
                            <button class="btn btn-outlined" onclick="window.app.copyToClipboard('${window.location.origin}/view?id=${sequentialId}')">
                                <i class="material-icons">content_copy</i>
                            </button>
                        </div>
                    </div>
                    <div class="access-item">
                        <label>Raw Code (Sequential):</label>
                        <div class="access-links">
                            <code>/raw/seq/${sequentialId}</code>
                            <button class="btn btn-outlined" onclick="window.app.copyToClipboard('${window.location.origin}/raw/seq/${sequentialId}')">
                                <i class="material-icons">content_copy</i>
                            </button>
                        </div>
                    </div>
                    <div class="access-item">
                        <label>API Endpoint:</label>
                        <div class="access-links">
                            <code>/api/command/seq/${sequentialId}</code>
                            <button class="btn btn-outlined" onclick="window.app.copyToClipboard('${window.location.origin}/api/command/seq/${sequentialId}')">
                                <i class="material-icons">content_copy</i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add modal styles if not already present
        if (!document.querySelector('#quick-access-styles')) {
            const styles = document.createElement('style');
            styles.id = 'quick-access-styles';
            styles.textContent = `
                .quick-access-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                }

                .modal-content {
                    background: var(--surface);
                    border-radius: 12px;
                    box-shadow: var(--shadow-xl);
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow: auto;
                    position: relative;
                    z-index: 1;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid var(--outline);
                }

                .modal-header h3 {
                    margin: 0;
                    color: var(--on-surface);
                }

                .modal-body {
                    padding: 20px;
                }

                .access-item {
                    margin-bottom: 20px;
                }

                .access-item label {
                    display: block;
                    font-weight: 500;
                    color: var(--on-surface);
                    margin-bottom: 8px;
                }

                .access-links {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--surface-variant);
                    padding: 12px;
                    border-radius: 8px;
                }

                .access-links code {
                    flex: 1;
                    background: none;
                    color: var(--primary);
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                }

                .command-id-badge {
                    background: var(--primary);
                    color: var(--on-primary);
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                    margin-left: auto;
                }

                .command-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    margin-bottom: 12px;
                }

                .command-header .command-title {
                    flex: 1;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Link copied to clipboard! 📋', 'success');
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.showToast('Link copied to clipboard! 📋', 'success');
            } catch (err) {
                this.showToast('Failed to copy link', 'error');
            }
            document.body.removeChild(textArea);
        }
    }

    static copyToClipboard(text) {
        return navigator.clipboard.writeText(text).then(() => {
            return true;
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        });
    }
}

// Add CSS for ripple animation only once
if (!document.querySelector('#main-app-styles')) {
    const appStyles = document.createElement('style');
    appStyles.id = 'main-app-styles';
    appStyles.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }

      .notification {
        position: fixed;
        bottom: 80px;
        left: 16px;
        right: 16px;
        background: #3b82f6;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 1003;
        transform: translateY(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-width: 400px;
        margin: 0 auto;
        text-align: center;
      }

      .notification-success {
        background: #10b981;
      }

      .notification-warning {
        background: #f59e0b;
      }

      .notification-error {
        background: #ef4444;
      }

      .loading {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 64px 16px;
        color: var(--on-surface);
        grid-column: 1 / -1;
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(99, 102, 241, 0.3);
        border-top: 4px solid var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .loading-text {
        font-size: 16px;
        font-weight: 400;
        color: var(--on-surface);
        opacity: 0.8;
      }

      .quick-access-container {
        margin-top: 16px;
        padding: 16px;
        background: var(--surface-variant);
        border-radius: 12px;
        border: 1px solid var(--outline);
      }

      .quick-access-input-container {
        display: flex;
        align-items: center;
        gap: 12px;
        background: var(--surface);
        padding: 12px;
        border-radius: 8px;
        border: 1px solid var(--outline);
      }

      .quick-access-input {
        flex: 1;
        border: none;
        background: none;
        color: var(--on-surface);
        font-size: 16px;
        outline: none;
      }

      .quick-access-input::placeholder {
        color: var(--on-surface-variant);
      }

      .command-id-badge {
        background: var(--primary);
        color: var(--on-primary);
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        margin-left: auto;
      }

      .command-header {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 12px;
      }

      .command-header .command-title {
        flex: 1;
      }
    `;
    document.head.appendChild(appStyles);
}

// Initialize the app
const app = new GoatMartApp();

// Export for use in other scripts
window.app = app;
window.GoatMartApp = GoatMartApp;