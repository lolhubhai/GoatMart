// Main JavaScript file for GoatMart with Android UI integration
class GoatMartApp {
    constructor() {
        this.currentSearch = '';
        this.currentType = 'all';
        this.isLoading = false;
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
            this.loadCommands();
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

    setupSearchAndFilters() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            // Clear any existing listeners
            searchInput.removeEventListener('input', this.searchHandler);

            // Create bound search handler
            this.searchHandler = this.debounce((e) => {
                const searchValue = e.target.value.trim();
                this.currentSearch = searchValue;
                console.log('Searching for:', searchValue);
                this.loadCommands(this.currentSearch, this.currentType);
            }, 300);

            searchInput.addEventListener('input', this.searchHandler);

            // Add visual feedback
            searchInput.addEventListener('focus', () => {
                searchInput.parentElement.style.borderColor = 'var(--primary)';
                searchInput.parentElement.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.2)';
            });

            searchInput.addEventListener('blur', () => {
                searchInput.parentElement.style.borderColor = '';
                searchInput.parentElement.style.boxShadow = '';
            });
        }

        // Quick access functionality
        const quickAccessInput = document.getElementById('quickAccessInput');
        const quickAccessBtn = document.getElementById('quickAccessBtn');
        
        if (quickAccessInput && quickAccessBtn) {
            const handleQuickAccess = () => {
                const sequentialId = parseInt(quickAccessInput.value);
                if (sequentialId && sequentialId > 0) {
                    window.location.href = `/view/seq/${sequentialId}`;
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
                this.loadCommands(this.currentSearch, this.currentType);
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

    async loadCommands(search = '', type = 'all') {
        const container = document.getElementById('commandsContainer');

        // Initialize loading states
        this.currentSearch = search;
        this.currentType = type;
        this.isLoading = true;

        container.innerHTML = '<div class="loading"><div class="loading-spinner"></div><div class="loading-text">Loading all commands...</div></div>';

        try {
            const params = new URLSearchParams();
            if (search && search.trim()) params.append('search', search.trim());
            if (type !== 'all') params.append('category', type);
            // Remove limit to get all commands
            params.append('limit', '1000'); // Set high limit to get all commands

            const response = await fetch(`/api/items?${params}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const commandCards = data.items.map(command => this.createCommandCard(command)).join('');
                container.innerHTML = commandCards;

                // Re-attach event listeners to new cards
                this.attachCardEventListeners();
            } else {
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 64px 16px; color: var(--on-surface); opacity: 0.7;">
                        <i class="material-icons" style="font-size: 64px; margin-bottom: 16px;">search_off</i>
                        <h3 style="margin-bottom: 8px; font-weight: 400;">No commands found</h3>
                        <p>Try adjusting your search terms or filters</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading commands:', error);
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 64px 16px; color: var(--error);">
                    <i class="material-icons" style="font-size: 64px; margin-bottom: 16px;">error</i>
                    <h3 style="margin-bottom: 8px; font-weight: 400;">Error loading commands</h3>
                    <p>Please try again later</p>
                    <button class="btn btn-contained" onclick="window.app.loadCommands('${search}', '${type}')" style="margin-top: 16px;">
                        <i class="material-icons">refresh</i>
                        Try Again
                    </button>
                </div>
            `;
        }

        this.isLoading = false;
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
                        <a href="/view/${command.shortId || command.itemID}" class="btn btn-contained" style="flex: 1;">
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
                            <code>/view/seq/${sequentialId}</code>
                            <button class="btn btn-outlined" onclick="window.app.copyToClipboard('${window.location.origin}/view/seq/${sequentialId}')">
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