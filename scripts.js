/**
 * Select Library Landing Page Scripts
 * Modern promotional page functionality
 */

class SelectLandingPage {
  constructor() {
    this.init();
  }

  init() {
    this.setupTheme();
    this.setupSmoothScrolling();
    this.setupCodeCopy();
    this.setupAnimations();
    this.setupInteractiveElements();
    this.setupToastNotifications();
    console.log('Select Landing Page initialized successfully! 🎉');
  }

  // ===== THEME MANAGEMENT =====
  setupTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Get saved theme or default to light
    const savedTheme = this.getStoredTheme() || 'light';
    this.setTheme(savedTheme);

    themeToggle?.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-bs-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme);
      this.storeTheme(newTheme);
    });
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.className = theme === 'dark' ? 'bi bi-sun-fill fs-5' : 'bi bi-moon-stars-fill fs-5';
    }
  }

  getStoredTheme() {
    try {
      return localStorage?.getItem('select-theme');
    } catch (e) {
      return null;
    }
  }

  storeTheme(theme) {
    try {
      localStorage?.setItem('select-theme', theme);
    } catch (e) {
      // Silent fail in environments without localStorage
    }
  }

  // ===== SMOOTH SCROLLING =====
  setupSmoothScrolling() {
    // Enable smooth scrolling for the entire document
    document.documentElement.style.scrollBehavior = 'smooth';

    // Handle navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && href !== '#') {
          e.preventDefault();
          this.scrollToSection(href);
        }
      });
    });

    // Handle CTA buttons
    const getStartedButtons = document.querySelectorAll('.get-started-btn, .btn-hero-primary');
    getStartedButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.scrollToSection('#installation');
      });
    });
  }

  scrollToSection(selector) {
    const target = document.querySelector(selector);
    if (target) {
      const offset = 80; // Account for fixed navbar
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

  // ===== CODE COPY FUNCTIONALITY =====
  setupCodeCopy() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
      button.addEventListener('click', () => {
        const text = button.getAttribute('data-clipboard-text');
        if (text) {
          this.copyToClipboard(text, button);
        }
      });
    });
  }

  async copyToClipboard(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      const originalHTML = button.innerHTML;
      button.innerHTML = '<i class="bi bi-check-lg"></i>';
      button.classList.add('copied');
      
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('copied');
      }, 2000);
      
      this.showToast('Code copied to clipboard!', 'success', 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      this.showToast('Failed to copy code', 'error', 3000);
    }
  }

  // ===== ANIMATIONS =====
  setupAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll(
      '.feature-card, .install-card, .demo-card, .use-case-card, .section-badge'
    );
    
    animateElements.forEach(el => observer.observe(el));

    // Enhance floating animation
    this.enhanceFloatingAnimation();
  }

  enhanceFloatingAnimation() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    floatingElements.forEach((element, index) => {
      // Add random movement variation
      const randomDelay = Math.random() * 5;
      const randomDuration = 15 + Math.random() * 10;
      
      element.style.setProperty('--delay', `${randomDelay}s`);
      element.style.animationDuration = `${randomDuration}s`;
    });
  }

  // ===== INTERACTIVE ELEMENTS =====
  setupInteractiveElements() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.feature-card, .demo-card, .use-case-card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });

    // Interactive demo elements
    this.setupDemoInteractions();

    // Navbar scroll effect
    this.setupNavbarScroll();
  }

  setupDemoInteractions() {
    // Mock select interactions
    const mockSelects = document.querySelectorAll('.mock-select-demo');
    mockSelects.forEach(select => {
      select.addEventListener('click', () => {
        select.style.borderColor = 'var(--primary-color)';
        select.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
        
        setTimeout(() => {
          select.style.borderColor = 'rgba(74, 144, 226, 0.2)';
          select.style.boxShadow = 'none';
        }, 2000);
        
        this.showToast('Interactive demo clicked!', 'info', 2000);
      });
    });
  }

  setupNavbarScroll() {
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(20px)';
      } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.8)';
      }
      
      lastScrollTop = scrollTop;
    });
  }

  // ===== TOAST NOTIFICATIONS =====
  setupToastNotifications() {
    // Create toast container if it doesn't exist
    if (!document.querySelector('.toast-container')) {
      const toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
      toastContainer.style.zIndex = '9999';
      document.body.appendChild(toastContainer);
    }
  }

  showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;

    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toastElement = document.createElement('div');
    toastElement.id = toastId;
    toastElement.className = `toast align-items-center text-white bg-${this.getBootstrapColorClass(type)} border-0`;
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');

    toastElement.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi ${this.getToastIcon(type)} me-2"></i>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    toastContainer.appendChild(toastElement);

    // Initialize Bootstrap toast if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
      const bsToast = new bootstrap.Toast(toastElement, {
        delay: duration
      });
      bsToast.show();
      
      // Remove from DOM after hiding
      toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
      });
    } else {
      // Fallback for environments without Bootstrap
      toastElement.style.display = 'block';
      setTimeout(() => {
        toastElement.remove();
      }, duration);
    }
  }

  getBootstrapColorClass(type) {
    const colorMap = {
      success: 'success',
      error: 'danger',
      danger: 'danger',
      warning: 'warning',
      info: 'info',
      primary: 'primary'
    };
    return colorMap[type] || 'info';
  }

  getToastIcon(type) {
    const iconMap = {
      success: 'bi-check-circle-fill',
      error: 'bi-exclamation-triangle-fill',
      danger: 'bi-exclamation-triangle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill',
      primary: 'bi-info-circle-fill'
    };
    return iconMap[type] || 'bi-info-circle-fill';
  }

  // ===== ERROR HANDLING =====
  handleError(error, context = 'Unknown') {
    console.error(`Select Landing Page Error (${context}):`, error);
    
    // Show user-friendly error message
    this.showToast(
      'Something went wrong. Please check the console for details.',
      'error',
      5000
    );
  }

  // ===== RESPONSIVE BEHAVIOR =====
  setupResponsiveBehavior() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    const handleMediaQuery = (e) => {
      if (e.matches) {
        // Mobile behavior
        this.enableMobileOptimizations();
      } else {
        // Desktop behavior
        this.enableDesktopOptimizations();
      }
    };
    
    // Use the modern API if available, fallback to deprecated method
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaQuery);
    } else {
      mediaQuery.addListener(handleMediaQuery);
    }
    
    handleMediaQuery(mediaQuery);
  }

  enableMobileOptimizations() {
    // Reduce animation intensity on mobile
    document.documentElement.style.setProperty('--transition', 'all 0.2s ease');
    
    // Adjust touch targets
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(btn => {
      if (btn.offsetHeight < 44) {
        btn.style.minHeight = '44px';
      }
    });
  }

  enableDesktopOptimizations() {
    // Restore full animations on desktop
    document.documentElement.style.setProperty('--transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
    
    // Enable hover effects
    document.body.classList.add('desktop-mode');
  }

  // ===== KEYBOARD SHORTCUTS =====
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K for search (if implemented)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.showToast('Search feature coming soon!', 'info', 2000);
      }
      
      // Ctrl/Cmd + T for theme toggle
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        document.querySelector('.theme-toggle')?.click();
      }
    });
  }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Initialize landing page
    const landingPage = new SelectLandingPage();
    
    // Setup responsive behavior
    landingPage.setupResponsiveBehavior();
    
    // Setup keyboard shortcuts
    landingPage.setupKeyboardShortcuts();
    
    // Global error handler
    window.addEventListener('error', (e) => {
      landingPage.handleError(e.error, 'Global Error Handler');
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      landingPage.handleError(e.reason, 'Unhandled Promise Rejection');
    });
    
  } catch (error) {
    console.error('Failed to initialize Select Landing Page:', error);
  }
});

// ===== ADDITIONAL UTILITIES =====

// Debounce utility
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// Throttle utility
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SelectLandingPage, debounce, throttle };
}