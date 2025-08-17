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
    this.setupAsSelect3Demos();
  }

  setupTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
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
    
    const themeChangedEvent = new CustomEvent('themeChanged', { detail: { theme } });
    document.dispatchEvent(themeChangedEvent);
    
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      const isDarkTheme = theme === 'dark';
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (isDarkTheme) {
        navbar.style.background = scrollTop > 100 ? 'rgba(26, 32, 44, 0.95)' : 'rgba(26, 32, 44, 0.8)';
      } else {
        navbar.style.background = scrollTop > 100 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)';
      }
      navbar.style.backdropFilter = 'blur(20px)';
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
    }
  }

  setupSmoothScrolling() {
    const enableSmoothScroll = () => {
      document.documentElement.style.scrollBehavior = 'smooth';
    };
    
    const disableSmoothScroll = () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
    
    document.addEventListener('click', (e) => {
      if (e.target.closest('.as-select3-container') || 
          e.target.closest('.as-select3-dropdown')) {
        disableSmoothScroll();
      }
    }, true);
    
    document.addEventListener('change', () => {
      setTimeout(enableSmoothScroll, 100);
    });
    
    enableSmoothScroll();

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
      const offset = 80;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

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
    
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        const tabsWithCopy = ['basicSelectTabs', 'multiSelectTabs', 'maxSelectTabs'];
        
        tabsWithCopy.forEach(tabId => {
          const tabElement = document.getElementById(tabId);
          if (tabElement) {
            const tabButtons = tabElement.querySelectorAll('[data-bs-toggle="tab"]');
            
            tabButtons.forEach(btn => {
              btn.addEventListener('shown.bs.tab', (e) => {
                const targetPanel = document.querySelector(e.target.getAttribute('data-bs-target'));
                if (targetPanel) {
                  const copyBtn = targetPanel.querySelector('.copy-btn');
                  if (copyBtn) {
                    copyBtn.addEventListener('click', () => {
                      const text = copyBtn.getAttribute('data-clipboard-text');
                      if (text) {
                        this.copyToClipboard(text, copyBtn);
                      }
                    });
                  }
                }
              });
            });
          }
        });
      }, 500);
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
      this.showToast('Failed to copy code', 'error', 3000);
    }
  }

  setupAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target.classList.contains('demo-card')) {
          observer.unobserve(entry.target);
          return;
        }
        
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const animateElements = document.querySelectorAll(
      '.feature-card, .install-card, .use-case-card, .section-badge'
    );
    
    animateElements.forEach(el => observer.observe(el));

    this.enhanceFloatingAnimation();
  }

  enhanceFloatingAnimation() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    floatingElements.forEach((element, index) => {
      const randomDelay = Math.random() * 5;
      const randomDuration = 15 + Math.random() * 10;
      
      element.style.setProperty('--delay', `${randomDelay}s`);
      element.style.animationDuration = `${randomDuration}s`;
    });
  }

  setupInteractiveElements() {

    const cards = document.querySelectorAll('.feature-card, .use-case-card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
                if (!card.querySelector('.as-select3')) {
          card.style.transform = 'translateY(-8px)';
        }
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });

    this.setupDemoInteractions();
    this.setupNavbarScroll();
  }

  setupDemoInteractions() {
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
    
    const updateNavbarBackground = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
      
      if (isDarkTheme) {
        if (scrollTop > 100) {
          navbar.style.background = 'rgba(26, 32, 44, 0.95)';
          navbar.style.backdropFilter = 'blur(20px)';
        } else {
          navbar.style.background = 'rgba(26, 32, 44, 0.8)';
        }
      } else {
        if (scrollTop > 100) {
          navbar.style.background = 'rgba(255, 255, 255, 0.95)';
          navbar.style.backdropFilter = 'blur(20px)';
        } else {
          navbar.style.background = 'rgba(255, 255, 255, 0.8)';
        }
      }
      
      lastScrollTop = scrollTop;
    };
    
    window.addEventListener('scroll', updateNavbarBackground);
    document.addEventListener('themeChanged', updateNavbarBackground);
    updateNavbarBackground();
  }

  setupToastNotifications() {
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

    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
      const bsToast = new bootstrap.Toast(toastElement, {
        delay: duration
      });
      bsToast.show();
      
      toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
      });
    } else {
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

  handleError(error, context = 'Unknown') {
    console.error(`Select Landing Page Error (${context}):`, error);
    
    this.showToast(
      'Something went wrong. Please check the console for details.',
      'error',
      5000
    );
  }

  setupResponsiveBehavior() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    const handleMediaQuery = (e) => {
      if (e.matches) {
        this.enableMobileOptimizations();
      } else {
        this.enableDesktopOptimizations();
      }
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaQuery);
    } else {
      mediaQuery.addListener(handleMediaQuery);
    }
    
    handleMediaQuery(mediaQuery);
  }

  enableMobileOptimizations() {
    document.documentElement.style.setProperty('--transition', 'all 0.2s ease');
    
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(btn => {
      if (btn.offsetHeight < 44) {
        btn.style.minHeight = '44px';
      }
    });
  }

  enableDesktopOptimizations() {
    document.documentElement.style.setProperty('--transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
    
    document.body.classList.add('desktop-mode');
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.showToast('Search feature coming soon!', 'info', 2000);
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        document.querySelector('.theme-toggle')?.click();
      }
    });
  }

  setupAsSelect3Demos() {
    if (typeof $ === 'undefined') {
      return;
    }
    
    setTimeout(() => {
      if (typeof $.fn.asSelect3 === 'undefined') {
        return;
      }
      
      this.initializeSelectComponents();
      this.enhanceAsSelect3Icons();
      

      if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
      }
    }, 100);
  }
  
  enhanceAsSelect3Icons() {
    $('.as-select3-option-icon, .as-select3-tag-icon, .as-select3-single-icon').each(function() {
      const $icon = $(this);
      if (!$icon.find('img').length && !$icon.find('i').length) {
        $icon.css({
          'display': 'inline-flex',
          'justify-content': 'center',
          'align-items': 'center'
        });
      }
    });
  }
  
  initializeSelectComponents() {

    if ($('#basic-demo-select').length) {
      try {
        $('#basic-demo-select').asSelect3({
          placeholder: 'Select an option',
          searchable: false
        });
      } catch (err) {
      }
    }
    
    if ($('#multi-demo-select').length) {
      try {
        $('#multi-demo-select').asSelect3({
          placeholder: 'Select programming languages',
          searchable: true,
          searchPlaceholder: 'Search languages...',
          selectAll: true,
          clearAll: true
        });
      } catch (err) {
      }
    }
    
    if ($('#max-demo-select').length) {
      try {
        $('#max-demo-select').asSelect3({
          placeholder: 'Select up to 3 skills',
          searchable: true,
          searchPlaceholder: 'Find skills...',
          maxSelection: 3
        });
        
        $('#max-demo-select').on('asSelect3:maxselection', function(e) {
          $('#max-selection-warning').removeClass('d-none');
          setTimeout(() => {
            $('#max-selection-warning').addClass('d-none');
          }, 3000);
        });
      } catch (err) {
      }
    }
    

    if ($('#profile-demo-select').length) {
      try {
        $('#profile-demo-select').asSelect3({
          placeholder: 'Select team members',
          imageWidth: 36,
          imageHeight: 36,
          imageBorderRadius: '50%',
          imagePosition: 'left',
          searchable: true
        });
      } catch (err) {
      }
    }
    

    if ($('#remote-demo-select').length) {
      try {
        $('#remote-demo-select').asSelect3({
          placeholder: 'Search for random users...',
          searchable: true,
          remote: async function(searchTerm) {
            try {
              let url = 'https://randomuser.me/api/?results=10';
              url += '&inc=name,picture,location,email,login';
              url += '&nat=us,gb,fr,au,ca';
              
              if (searchTerm) {
                url += '&seed=' + encodeURIComponent(searchTerm);
              }
              
              const response = await fetch(url);
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              const data = await response.json();
              
              return data.results.map(function(user) {
                const fullName = user.name.first + ' ' + user.name.last;
                return {
                  value: user.login ? user.login.uuid : Math.random().toString(36).substring(2),
                  text: fullName,
                  icon: user.picture.medium,
                  html: '<div class="d-flex align-items-center gap-2">' +
                        '<img src="' + user.picture.medium + '" width="48" height="48" style="border-radius:50%">' +
                        '<div>' +
                        '<div class="fw-semibold">' + fullName + '</div>' +
                        '<div class="small text-muted">' + (user.location ? user.location.city + ', ' + user.location.country : '') + '</div>' +
                        '</div>' +
                        '<div class="ms-auto small text-muted">' + 
                        '<i class="bi bi-envelope me-1"></i>' + 
                        user.email +
                        '</div>' +
                        '</div>'
                };
              });
              
            } catch (error) {
              console.error('RandomUser API Error:', error);
              if (!$('#randomuser-api-error').length) {
                $('<div id="randomuser-api-error" class="alert alert-danger mt-2" role="alert">' +
                  '<i class="bi bi-exclamation-triangle-fill me-2"></i>' +
                  'Error fetching data from RandomUser API. Please try again later.' +
                  '</div>').insertAfter('#remote-demo-select');
                
                setTimeout(function() {
                  $('#randomuser-api-error').fadeOut(function() { $(this).remove(); });
                }, 5000);
              }
              return [];
            }
          }
        });
        
        if (!$('#remote-demo-select').next('.mt-2.small.text-muted').length) {
          $('<div class="mt-2 small text-muted">' +
            '<i class="bi bi-info-circle me-1"></i>' +
            'Click to load random users from RandomUser API. Try multiple times to see different users.' +
            '</div>').insertAfter('#remote-demo-select');
        }
      } catch (err) {
        console.error('Error initializing remote select:', err);
      }
    }
    

    if ($('#custom-demo-select').length) {
      try {
        $('#custom-demo-select').asSelect3({
          placeholder: 'How are you feeling today?',
          searchable: true,
          theme: 'custom-purple'
        });
      } catch (err) {
      }
    }
    
    if ($('#custom-demo-select-multi').length) {
      try {
        $('#custom-demo-select-multi').asSelect3({
          placeholder: 'Select your activities',
          searchable: true,
          selectAll: true,
          clearAll: true,
          theme: 'custom-purple'
        });
      } catch (err) {
      }
    }
    

    if ($('#hero-demo-select').length) {
      try {
        $('#hero-demo-select').asSelect3({
          searchable: true,
          selectAll: false,
          clearAll: true,
          placeholder: 'Select frameworks...',
          searchPlaceholder: 'Search frameworks...'
        });
      } catch (err) {
      }
    }

    if ($('#country-select').length) {
      try {
        $('#country-select').asSelect3({
          searchable: true,
          selectAll: true,
          clearAll: true,
          placeholder: 'Select countries...',
          searchPlaceholder: 'Search countries...'
        });
      } catch (err) {
      }
    }

    if ($('#priority-select').length) {
      try {
        $('#priority-select').asSelect3({
          searchable: false,
          placeholder: 'Select priority...'
        });
      } catch (err) {
      }
    }

    if ($('#skills-select').length) {
      try {
        const skillsSelect = $('#skills-select').asSelect3({
          searchable: true,
          selectAll: false,
          clearAll: true,
          maxSelection: 3,
          placeholder: 'Select up to 3 skills...',
          searchPlaceholder: 'Search skills...'
        });

        $('#skills-select').on('asSelect3:maxselection', function(e) {
          $('#skills-warning').removeClass('d-none');
          setTimeout(() => {
            $('#skills-warning').addClass('d-none');
          }, 3000);
        });
      } catch (err) {
      }
    }

    if ($('#repo-select').length) {
      try {
        $('#repo-select').asSelect3({
          searchable: true,
          placeholder: 'Type to search repositories...',
          remote: this.searchGitHubRepos.bind(this),
          searchDelay: 500,
          noResultsText: 'No repositories found',
          loadingText: 'Searching repositories...'
        });
      } catch (err) {
        console.error('Error initializing repo select:', err);
      }
    }
  }

  async searchGitHubRepos(query) {
    if (!query || query.length < 2) {
      return [];
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const mockRepos = [
      { value: 'facebook/react', text: 'React', icon: '⚛️' },
      { value: 'vuejs/vue', text: 'Vue.js', icon: '💚' },
      { value: 'angular/angular', text: 'Angular', icon: '🅰️' },
      { value: 'microsoft/typescript', text: 'TypeScript', icon: '💙' },
      { value: 'nodejs/node', text: 'Node.js', icon: '💚' },
      { value: 'jquery/jquery', text: 'jQuery', icon: '💛' },
      { value: 'twbs/bootstrap', text: 'Bootstrap', icon: '🟣' },
      { value: 'webpack/webpack', text: 'Webpack', icon: '📦' },
      { value: 'babel/babel', text: 'Babel', icon: '🔄' },
      { value: 'expressjs/express', text: 'Express.js', icon: '🚂' },
      { value: 'lodash/lodash', text: 'Lodash', icon: '🔧' },
      { value: 'axios/axios', text: 'Axios', icon: '🌐' },
      { value: 'moment/moment', text: 'Moment.js', icon: '⏰' },
      { value: 'chartjs/chart.js', text: 'Chart.js', icon: '📊' },
      { value: 'prettier/prettier', text: 'Prettier', icon: '💅' },
      { value: 'eslint/eslint', text: 'ESLint', icon: '🔍' },
      { value: 'parcel-bundler/parcel', text: 'Parcel', icon: '📦' },
      { value: 'rollup/rollup', text: 'Rollup', icon: '🎲' },
      { value: 'vitejs/vite', text: 'Vite', icon: '⚡' },
      { value: 'nuxt/nuxt.js', text: 'Nuxt.js', icon: '🟢' }
    ];

    const filtered = mockRepos.filter(repo => 
      repo.text.toLowerCase().includes(query.toLowerCase()) ||
      repo.value.toLowerCase().includes(query.toLowerCase())
    );

    return filtered.slice(0, 10);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    if (typeof $ === 'undefined') {
      console.error('jQuery is not available. Make sure it is loaded before scripts.js.');
      return;
    }
    
    $(window).on('load', function() {
      try {
        const landingPage = new SelectLandingPage();
        
        landingPage.setupResponsiveBehavior();
        landingPage.setupKeyboardShortcuts();
        
        window.addEventListener('error', (e) => {
          landingPage.handleError(e.error, 'Global Error Handler');
        });
        
        window.addEventListener('unhandledrejection', (e) => {
          landingPage.handleError(e.reason, 'Unhandled Promise Rejection');
        });
      } catch (error) {
        console.error('Failed to initialize Select Landing Page on window load:', error);
      }
    });
    
  } catch (error) {
    console.error('Failed to initialize Select Landing Page:', error);
  }
});

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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SelectLandingPage, debounce, throttle };
}

document.addEventListener('DOMContentLoaded', function() {
  if (typeof $ === 'undefined' || typeof $.fn.select3 === 'undefined') {
    return;
  }
  
  $('.demo-card').off('mouseenter mouseleave');
  $('.demo-card, .glass-card').has('.as-select3-container').css('overflow', 'visible');
});
