class ScrollController {
   constructor() {
       this.scrollProgress = null;
       this.backToTopButton = null;
       this.lastScrollY = 0;
       this.scrollDirection = 'down';
       this.scrollThreshold = 100;
       this.parallaxElements = [];
       
       this.init();
   }

   init() {
       this.bindElements();
       this.setupEventListeners();
       this.setupParallaxElements();
       this.updateScrollProgress();
       this.updateBackToTopVisibility();
   }

   bindElements() {
       this.scrollProgress = document.querySelector('.scroll-progress');
       this.backToTopButton = document.querySelector('.back-to-top');
       this.parallaxElements = document.querySelectorAll('.parallax-element');
   }

   setupEventListeners() {
       let scrollTimeout;
       window.addEventListener('scroll', () => {
           if (!scrollTimeout) {
               scrollTimeout = setTimeout(() => {
                   this.handleScroll();
                   scrollTimeout = null;
               }, 16);
           }
       });

       if (this.backToTopButton) {
           this.backToTopButton.addEventListener('click', (e) => {
               e.preventDefault();
               this.scrollToTop();
           });
       }

       document.addEventListener('keydown', (e) => {
           this.handleKeyboardScroll(e);
       });

       this.setupSmoothScrolling();
   }

   handleScroll() {
       const currentScrollY = window.pageYOffset;
       
       this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';
       this.lastScrollY = currentScrollY;
       
       this.updateScrollProgress();
       this.updateBackToTopVisibility();
       this.updateParallaxElements();
       this.updateScrollDirection();
       
       this.notifyScrollChange();
   }

   updateScrollProgress() {
       if (!this.scrollProgress) return;
       
       const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
       const scrolled = (window.pageYOffset / scrollHeight) * 100;
       
       this.scrollProgress.style.width = `${Math.min(scrolled, 100)}%`;
   }

   updateBackToTopVisibility() {
       if (!this.backToTopButton) return;
       
       const shouldShow = window.pageYOffset > this.scrollThreshold;
       
       if (shouldShow) {
           this.backToTopButton.classList.add('visible');
       } else {
           this.backToTopButton.classList.remove('visible');
       }
   }

   updateParallaxElements() {
       this.parallaxElements.forEach(element => {
           const rect = element.getBoundingClientRect();
           const speed = element.dataset.parallaxSpeed || 0.5;
           const yPos = -(rect.top * speed);
           
           element.style.setProperty('--parallax-offset', `${yPos}px`);
       });
   }

   updateScrollDirection() {
       document.body.classList.remove('scroll-up', 'scroll-down');
       document.body.classList.add(`scroll-${this.scrollDirection}`);
   }

   notifyScrollChange() {
       window.dispatchEvent(new CustomEvent('portfolio:scroll', {
           detail: {
               scrollY: window.pageYOffset,
               direction: this.scrollDirection,
               progress: this.getScrollProgress()
           }
       }));
   }

   setupParallaxElements() {
       const additionalParallax = document.querySelectorAll('[data-parallax]');
       additionalParallax.forEach(element => {
           element.classList.add('parallax-element');
       });
       
       this.parallaxElements = document.querySelectorAll('.parallax-element');
   }

   setupSmoothScrolling() {
       document.addEventListener('click', (e) => {
           const link = e.target.closest('a[href^="#"]');
           if (!link) return;
           
           const href = link.getAttribute('href');
           if (href === '#') return;
           
           e.preventDefault();
           this.scrollToElement(href);
       });
   }

   handleKeyboardScroll(e) {
       if (e.target !== document.body && e.target.tagName !== 'BODY') return;
       
       switch (e.key) {
           case 'Home':
               e.preventDefault();
               this.scrollToTop();
               break;
           case 'End':
               e.preventDefault();
               this.scrollToBottom();
               break;
           case 'PageUp':
               e.preventDefault();
               this.scrollByViewport(-0.8);
               break;
           case 'PageDown':
               e.preventDefault();
               this.scrollByViewport(0.8);
               break;
           case 'ArrowUp':
               if (e.ctrlKey) {
                   e.preventDefault();
                   this.scrollToTop();
               }
               break;
           case 'ArrowDown':
               if (e.ctrlKey) {
                   e.preventDefault();
                   this.scrollToBottom();
               }
               break;
       }
   }

   scrollToTop() {
       this.scrollTo(0);
   }

   scrollToBottom() {
       this.scrollTo(document.documentElement.scrollHeight);
   }

   scrollByViewport(multiplier) {
       const viewportHeight = window.innerHeight;
       const targetScroll = window.pageYOffset + (viewportHeight * multiplier);
       this.scrollTo(targetScroll);
   }

   scrollTo(position) {
       window.scrollTo({
           top: Math.max(0, position),
           behavior: 'smooth'
       });
   }

   scrollToElement(selector, offset = 0) {
       const element = typeof selector === 'string' 
           ? document.querySelector(selector) 
           : selector;
           
       if (!element) return;
       
       const headerHeight = this.getHeaderHeight();
       const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - headerHeight - offset;
       
       this.scrollTo(targetPosition);
   }

   getScrollProgress() {
       const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
       return Math.min(window.pageYOffset / scrollHeight, 1);
   }

   getHeaderHeight() {
       const header = document.querySelector('.header') || document.querySelector('header');
       return header ? header.offsetHeight : 80;
   }

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
   }

   getElementsInViewport(selector, threshold = 0) {
       const elements = document.querySelectorAll(selector);
       return Array.from(elements).filter(element => 
           this.isInViewport(element, threshold)
       );
   }

   scrollToNextSection() {
       const sections = document.querySelectorAll('section[id]');
       const currentScrollY = window.pageYOffset + this.getHeaderHeight() + 50;
       
       for (let i = 0; i < sections.length; i++) {
           const sectionTop = sections[i].offsetTop;
           if (sectionTop > currentScrollY) {
               this.scrollToElement(sections[i]);
               break;
           }
       }
   }

   scrollToPreviousSection() {
       const sections = document.querySelectorAll('section[id]');
       const currentScrollY = window.pageYOffset + this.getHeaderHeight() + 50;
       
       for (let i = sections.length - 1; i >= 0; i--) {
           const sectionTop = sections[i].offsetTop;
           if (sectionTop < currentScrollY - 100) {
               this.scrollToElement(sections[i]);
               break;
           }
       }
   }

   addScrollListener(callback) {
       window.addEventListener('portfolio:scroll', callback);
   }

   removeScrollListener(callback) {
       window.removeEventListener('portfolio:scroll', callback);
   }

   getScrollPosition() {
       return {
           x: window.pageXOffset || document.documentElement.scrollLeft,
           y: window.pageYOffset || document.documentElement.scrollTop
       };
   }

   getViewportDimensions() {
       return {
           width: window.innerWidth || document.documentElement.clientWidth,
           height: window.innerHeight || document.documentElement.clientHeight
       };
   }

   lockScroll() {
       document.body.style.overflow = 'hidden';
       document.body.style.paddingRight = this.getScrollbarWidth() + 'px';
   }

   unlockScroll() {
       document.body.style.overflow = '';
       document.body.style.paddingRight = '';
   }

   getScrollbarWidth() {
       const outer = document.createElement('div');
       outer.style.visibility = 'hidden';
       outer.style.overflow = 'scroll';
       outer.style.msOverflowStyle = 'scrollbar';
       document.body.appendChild(outer);
       
       const inner = document.createElement('div');
       outer.appendChild(inner);
       
       const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
       
       outer.parentNode.removeChild(outer);
       
       return scrollbarWidth;
   }

   onResize() {
       this.updateScrollProgress();
       this.updateParallaxElements();
   }

   destroy() {
       window.removeEventListener('scroll', this.handleScroll);
       
       if (this.backToTopButton) {
           this.backToTopButton.removeEventListener('click', this.scrollToTop);
       }
       
       this.parallaxElements = [];
       
       this.unlockScroll();
   }
}