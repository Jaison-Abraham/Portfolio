class PortfolioApp {
   constructor() {
       this.isLoaded = false;
       this.components = new Map();
       this.init();
   }

   async init() {
       try {
           if (document.readyState === 'loading') {
               document.addEventListener('DOMContentLoaded', () => this.bootstrap());
           } else {
               this.bootstrap();
           }
       } catch (error) {
           console.error('Failed to initialize app:', error);
       }
   }

   async bootstrap() {
       try {
           await this.loadComponents();
           this.initializeComponents();
           this.setupGlobalEvents();
           this.isLoaded = true;
           this.onAppLoaded();
           console.log('Portfolio app initialized successfully');
       } catch (error) {
           console.error('Failed to bootstrap app:', error);
       }
   }

   async loadComponents() {
       const componentMap = {
           'header': 'components/header.html',
           'hero': 'components/hero.html',
           'about': 'components/about.html',
           'skills': 'components/skills.html',
           'projects': 'components/projects.html',
           'contact': 'components/contact.html',
           'footer': 'components/footer.html'
       };

       const loadPromises = Object.entries(componentMap).map(async ([id, path]) => {
           try {
               const response = await fetch(path);
               if (!response.ok) {
                   throw new Error(`Failed to load ${path}: ${response.status}`);
               }
               const html = await response.text();
               const element = document.getElementById(id);
               if (element) {
                   element.innerHTML = html;
               } else {
                   console.warn(`Element with id '${id}' not found`);
               }
           } catch (error) {
               console.error(`Error loading component ${id}:`, error);
           }
       });

       await Promise.all(loadPromises);
   }

   initializeComponents() {
       if (typeof Navigation !== 'undefined') {
           this.components.set('navigation', new Navigation());
       }
       
       if (typeof Hero !== 'undefined') {
           this.components.set('hero', new Hero());
       }
       
       if (typeof Projects !== 'undefined') {
           this.components.set('projects', new Projects());
       }
       
       if (typeof Skills !== 'undefined') {
           this.components.set('skills', new Skills());
       }
       
       if (typeof Contact !== 'undefined') {
           this.components.set('contact', new Contact());
       }
       
       if (typeof AnimationController !== 'undefined') {
           this.components.set('animations', new AnimationController());
       }
       
       if (typeof ScrollController !== 'undefined') {
           this.components.set('scroll', new ScrollController());
       }
   }

   setupGlobalEvents() {
       let resizeTimeout;
       window.addEventListener('resize', () => {
           clearTimeout(resizeTimeout);
           resizeTimeout = setTimeout(() => {
               this.onWindowResize();
           }, 250);
       });

       let scrollTimeout;
       window.addEventListener('scroll', () => {
           if (!scrollTimeout) {
               scrollTimeout = setTimeout(() => {
                   this.onWindowScroll();
                   scrollTimeout = null;
               }, 16);
           }
       });

       document.addEventListener('visibilitychange', () => {
           this.onVisibilityChange();
       });

       window.addEventListener('orientationchange', () => {
           setTimeout(() => this.onOrientationChange(), 100);
       });

       document.addEventListener('keydown', (e) => {
           this.handleKeyboardNavigation(e);
       });
   }

   onWindowResize() {
       this.components.forEach(component => {
           if (component.onResize) {
               component.onResize();
           }
       });
   }

   onWindowScroll() {
       this.components.forEach(component => {
           if (component.onScroll) {
               component.onScroll();
           }
       });
   }

   onVisibilityChange() {
       if (document.hidden) {
           this.components.forEach(component => {
               if (component.onHide) {
                   component.onHide();
               }
           });
       } else {
           this.components.forEach(component => {
               if (component.onShow) {
                   component.onShow();
               }
           });
       }
   }

   onOrientationChange() {
       this.components.forEach(component => {
           if (component.onOrientationChange) {
               component.onOrientationChange();
           }
       });
   }

   handleKeyboardNavigation(e) {
       if (e.key === 'Escape') {
           this.components.forEach(component => {
               if (component.close) {
                   component.close();
               }
           });
       }

       if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
           if (e.target.tagName === 'BODY') {
               e.preventDefault();
               const scrollAmount = e.key === 'ArrowUp' ? -100 : 100;
               window.scrollBy({
                   top: scrollAmount,
                   behavior: 'smooth'
               });
           }
       }
   }

   onAppLoaded() {
       document.body.classList.add('app-loaded');
       
       window.dispatchEvent(new CustomEvent('portfolio:loaded', {
           detail: { app: this }
       }));

       this.initializeDeferredComponents();
   }

   initializeDeferredComponents() {
   }

   getComponent(name) {
       return this.components.get(name);
   }

   isAppLoaded() {
       return this.isLoaded;
   }

   destroy() {
       this.components.forEach(component => {
           if (component.destroy) {
               component.destroy();
           }
       });
       
       this.components.clear();
       this.isLoaded = false;
   }
}

const Utils = {
   debounce(func, wait, immediate = false) {
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
   },

   throttle(func, limit) {
       let inThrottle;
       return function(...args) {
           if (!inThrottle) {
               func.apply(this, args);
               inThrottle = true;
               setTimeout(() => inThrottle = false, limit);
           }
       };
   },

   isInViewport(element, threshold = 0) {
       const rect = element.getBoundingClientRect();
       const windowHeight = window.innerHeight || document.documentElement.clientHeight;
       const windowWidth = window.innerWidth || document.documentElement.clientWidth;
       
       return (
           rect.top >= -threshold &&
           rect.left >= -threshold &&
           rect.bottom <= windowHeight + threshold &&
           rect.right <= windowWidth + threshold
       );
   },

   scrollToElement(element, offset = 0) {
       if (typeof element === 'string') {
           element = document.querySelector(element);
       }
       
       if (element) {
           const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
           window.scrollTo({
               top: targetPosition,
               behavior: 'smooth'
           });
       }
   },

   getScrollPosition() {
       return {
           x: window.pageXOffset || document.documentElement.scrollLeft,
           y: window.pageYOffset || document.documentElement.scrollTop
       };
   },

   getViewportDimensions() {
       return {
           width: window.innerWidth || document.documentElement.clientWidth,
           height: window.innerHeight || document.documentElement.clientHeight
       };
   },

   isMobile() {
       return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
   },

   isTouchDevice() {
       return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
   }
};

const app = new PortfolioApp();

window.PortfolioApp = app;
window.Utils = Utils;