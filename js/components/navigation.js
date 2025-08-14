class Navigation {
    constructor() {
        this.header = null;
        this.nav = null;
        this.mobileMenu = null;
        this.navLinks = null;
        this.currentSection = '';
        this.isMenuOpen = false;
        this.scrollThreshold = 100;
        
        this.init();
    }

    init() {
        this.bindElements();
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.updateActiveSection();
    }

    bindElements() {
        this.header = document.querySelector('.header') || document.querySelector('header');
        this.nav = document.querySelector('.nav');
        this.mobileMenu = document.querySelector('.mobile-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.navLinksList = document.querySelector('.nav-links');
    }

    setupEventListeners() {
        if (this.mobileMenu) {
            this.mobileMenu.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }

        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavClick(e, link);
            });
        });

        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.nav.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));
    }

    setupIntersectionObserver() {
        const sections = document.querySelectorAll('section[id]');
        
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        this.sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.setActiveSection(entry.target.id);
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            this.sectionObserver.observe(section);
        });
    }

    handleNavClick(e, link) {
        const href = link.getAttribute('href');
        
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                this.scrollToSection(targetElement);
                this.setActiveSection(targetId);
                
                if (this.isMenuOpen) {
                    this.closeMobileMenu();
                }
            }
        }
    }

    scrollToSection(element) {
        const headerHeight = this.header ? this.header.offsetHeight : 80;
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    setActiveSection(sectionId) {
        if (this.currentSection === sectionId) return;
        
        this.currentSection = sectionId;
        
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        if (history.replaceState) {
            history.replaceState(null, null, `#${sectionId}`);
        }
    }

    updateActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const headerHeight = this.header ? this.header.offsetHeight : 80;
        const scrollPosition = window.pageYOffset + headerHeight + 100;

        let activeSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                activeSection = section.id;
            }
        });

        if (activeSection && activeSection !== this.currentSection) {
            this.setActiveSection(activeSection);
        }
    }

    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.isMenuOpen = true;
        this.mobileMenu?.classList.add('active');
        this.navLinksList?.classList.add('active');
        
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            document.addEventListener('click', this.handleOutsideClick);
        }, 100);
    }

    closeMobileMenu() {
        this.isMenuOpen = false;
        this.mobileMenu?.classList.remove('active');
        this.navLinksList?.classList.remove('active');
        
        document.body.style.overflow = '';
        
        document.removeEventListener('click', this.handleOutsideClick);
    }

    handleOutsideClick = (e) => {
        if (!this.nav?.contains(e.target)) {
            this.closeMobileMenu();
        }
    }

    handleResize() {
        const viewportWidth = window.innerWidth;
        
        if (viewportWidth >= 768 && this.isMenuOpen) {
            this.closeMobileMenu();
        }
    }

    onScroll() {
        this.updateScrollState();
        this.updateActiveSection();
    }

    updateScrollState() {
        if (!this.header) return;
        
        const scrollY = window.pageYOffset;
        
        if (scrollY > this.scrollThreshold) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }
    }

    close() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        }
    }

    getCurrentSection() {
        return this.currentSection;
    }

    navigateToSection(sectionId) {
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
            this.scrollToSection(targetElement);
            this.setActiveSection(sectionId);
        }
    }

    destroy() {
        if (this.mobileMenu) {
            this.mobileMenu.removeEventListener('click', this.toggleMobileMenu);
        }
        
        this.navLinks.forEach(link => {
            link.removeEventListener('click', this.handleNavClick);
        });
        
        document.removeEventListener('click', this.handleOutsideClick);
        
        if (this.sectionObserver) {
            this.sectionObserver.disconnect();
        }
        
        this.isMenuOpen = false;
        document.body.style.overflow = '';
    }
}