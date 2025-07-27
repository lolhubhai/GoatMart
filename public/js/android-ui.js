
// Android Material Design UI Enhancements
class AndroidUI {
    constructor() {
        this.init();
    }

    init() {
        this.setupRippleEffects();
        this.setupTouchFeedback();
        this.setupMaterialAnimations();
        this.setupAccessibility();
        this.setupSwipeGestures();
        this.detectMobile();
    }

    setupRippleEffects() {
        // Enhanced ripple effect for Material Design
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.btn, .chip, .command-card, .stat-card');
            if (!target) return;

            const ripple = document.createElement('span');
            const rect = target.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.className = 'material-ripple';
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: materialRipple 0.6s ease-out;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                pointer-events: none;
                z-index: 1000;
            `;

            target.style.position = 'relative';
            target.style.overflow = 'hidden';
            target.appendChild(ripple);

            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });

        // Add ripple animation keyframes
        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes materialRipple {
                    0% {
                        transform: scale(0);
                        opacity: 0.6;
                    }
                    100% {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupTouchFeedback() {
        // Enhanced touch feedback for mobile
        const touchElements = document.querySelectorAll('.btn, .chip, .command-card, .stat-card, .bottom-nav-item');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', (e) => {
                element.style.transform = 'scale(0.95)';
                element.style.transition = 'transform 0.1s ease';
                
                // Add haptic feedback if available
                if (navigator.vibrate) {
                    navigator.vibrate(10);
                }
            }, { passive: true });

            element.addEventListener('touchend', () => {
                setTimeout(() => {
                    element.style.transform = '';
                    element.style.transition = '';
                }, 100);
            }, { passive: true });

            element.addEventListener('touchcancel', () => {
                element.style.transform = '';
                element.style.transition = '';
            }, { passive: true });
        });
    }

    setupMaterialAnimations() {
        // Intersection Observer for fade-in animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe cards for animation
        document.querySelectorAll('.command-card, .stat-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            observer.observe(card);
        });
    }

    setupAccessibility() {
        // Enhanced accessibility for mobile
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // Add focus indicators
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-navigation *:focus {
                outline: 2px solid #6366f1 !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(style);
    }

    setupSwipeGestures() {
        // Basic swipe gesture support
        let startX = 0;
        let startY = 0;
        let distX = 0;
        let distY = 0;

        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;

            const touch = e.touches[0];
            distX = touch.clientX - startX;
            distY = touch.clientY - startY;
        }, { passive: true });

        document.addEventListener('touchend', () => {
            // Detect swipe gestures
            const threshold = 100;
            const restraint = 50;

            if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
                if (distX > 0) {
                    // Right swipe
                    this.handleSwipeRight();
                } else {
                    // Left swipe
                    this.handleSwipeLeft();
                }
            }

            // Reset values
            startX = 0;
            startY = 0;
            distX = 0;
            distY = 0;
        }, { passive: true });
    }

    handleSwipeRight() {
        // Handle right swipe - could navigate back or show sidebar
        console.log('Swipe right detected');
    }

    handleSwipeLeft() {
        // Handle left swipe - could navigate forward or hide sidebar
        console.log('Swipe left detected');
    }

    detectMobile() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            document.body.classList.add('mobile-device');
            this.setupMobileSpecificFeatures();
        }
    }

    setupMobileSpecificFeatures() {
        // Add mobile-specific features
        this.setupPullToRefresh();
        this.setupBottomNavigation();
        this.setupFabScrollBehavior();
    }

    setupPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let pullDistance = 0;
        const threshold = 100;
        let isPulling = false;

        const pullIndicator = document.createElement('div');
        pullIndicator.className = 'pull-to-refresh-indicator';
        pullIndicator.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: rgba(99, 102, 241, 0.9);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: translateY(-100%);
            transition: transform 0.3s ease;
            z-index: 1001;
            font-size: 14px;
            font-weight: 500;
        `;
        pullIndicator.innerHTML = '<i class="material-icons" style="margin-right: 8px;">refresh</i> Pull to refresh';
        document.body.appendChild(pullIndicator);

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;

            currentY = e.touches[0].clientY;
            pullDistance = currentY - startY;

            if (pullDistance > 0 && pullDistance < 150) {
                e.preventDefault();
                const progress = Math.min(pullDistance / threshold, 1);
                pullIndicator.style.transform = `translateY(${-100 + (progress * 100)}%)`;
            }
        }, { passive: false });

        document.addEventListener('touchend', () => {
            if (!isPulling) return;

            if (pullDistance >= threshold) {
                // Trigger refresh
                pullIndicator.innerHTML = '<i class="material-icons rotating" style="margin-right: 8px;">refresh</i> Refreshing...';
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                pullIndicator.style.transform = 'translateY(-100%)';
            }

            isPulling = false;
            pullDistance = 0;
        }, { passive: true });

        // Add rotation animation for refresh icon
        const rotationStyle = document.createElement('style');
        rotationStyle.textContent = `
            .rotating {
                animation: rotate 1s linear infinite;
            }
            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(rotationStyle);
    }

    setupBottomNavigation() {
        const bottomNav = document.querySelector('.bottom-nav');
        if (!bottomNav) return;

        // Hide/show bottom nav on scroll
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateBottomNav = () => {
            const scrollY = window.scrollY;
            const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';

            if (scrollDirection === 'down' && scrollY > 100) {
                bottomNav.style.transform = 'translateY(100%)';
            } else {
                bottomNav.style.transform = 'translateY(0)';
            }

            lastScrollY = scrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateBottomNav);
                ticking = true;
            }
        }, { passive: true });
    }

    setupFabScrollBehavior() {
        const fab = document.querySelector('.btn-fab');
        if (!fab) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateFab = () => {
            const scrollY = window.scrollY;
            const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';

            if (scrollDirection === 'down' && scrollY > 200) {
                fab.style.transform = 'scale(0)';
                fab.style.opacity = '0';
            } else {
                fab.style.transform = 'scale(1)';
                fab.style.opacity = '1';
            }

            lastScrollY = scrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateFab);
                ticking = true;
            }
        }, { passive: true });
    }

    // Material Design Snackbar
    static showSnackbar(message, action = null, duration = 4000) {
        // Remove existing snackbar
        const existing = document.querySelector('.material-snackbar');
        if (existing) {
            existing.remove();
        }

        const snackbar = document.createElement('div');
        snackbar.className = 'material-snackbar';
        snackbar.style.cssText = `
            position: fixed;
            bottom: 16px;
            left: 16px;
            right: 16px;
            background: #323232;
            color: white;
            padding: 14px 16px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 400;
            z-index: 1002;
            transform: translateY(100px);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 568px;
            margin: 0 auto;
        `;

        const messageEl = document.createElement('span');
        messageEl.textContent = message;
        snackbar.appendChild(messageEl);

        if (action) {
            const actionBtn = document.createElement('button');
            actionBtn.textContent = action.text;
            actionBtn.style.cssText = `
                background: none;
                border: none;
                color: #6366f1;
                font-weight: 500;
                font-size: 14px;
                text-transform: uppercase;
                cursor: pointer;
                padding: 8px;
                margin-left: 16px;
                border-radius: 4px;
            `;
            actionBtn.addEventListener('click', () => {
                action.handler();
                snackbar.remove();
            });
            snackbar.appendChild(actionBtn);
        }

        document.body.appendChild(snackbar);

        // Show snackbar
        setTimeout(() => {
            snackbar.style.transform = 'translateY(0)';
        }, 100);

        // Auto hide
        setTimeout(() => {
            snackbar.style.transform = 'translateY(100px)';
            setTimeout(() => {
                if (snackbar.parentNode) {
                    snackbar.parentNode.removeChild(snackbar);
                }
            }, 300);
        }, duration);

        return snackbar;
    }
}

// Initialize Android UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.androidUI = new AndroidUI();
});

// Export for use in other scripts
window.AndroidUI = AndroidUI;
