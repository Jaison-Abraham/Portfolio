class Projects {
    constructor() {
        this.projects = [];
        this.filteredProjects = [];
        this.currentFilter = 'all';
        this.container = null;
        this.filterButtons = null;
        this.projectCards = [];
        
        this.init();
    }

    async init() {
        this.bindElements();
        await this.loadProjectData();
        this.renderProjects();
        this.setupEventListeners();
        this.setupIntersectionObserver();
    }

    bindElements() {
        this.container = document.querySelector('.projects-grid');
        this.filterButtons = document.querySelectorAll('.project-filter');
        this.projectsSection = document.querySelector('#projects');
    }

    async loadProjectData() {
        try {
            const response = await fetch('data/projects.json');
            if (!response.ok) {
                throw new Error('Failed to load projects data');
            }
            const data = await response.json();
            this.projects = data.projects || [];
            this.filteredProjects = [...this.projects];
        } catch (error) {
            console.error('Error loading projects:', error);
            this.projects = this.getSampleProjects();
            this.filteredProjects = [...this.projects];
        }
    }

    getSampleProjects() {
        return [
            {
                id: 'smart-shopper',
                title: 'Smart Shopper - Expense Tracker',
                description: 'Cross-platform mobile app for managing groceries and splitting expenses among groups, inspired by Splitwise with real-time syncing capabilities.',
                icon: '',
                technologies: ['React Native', 'Firebase', 'Firestore', 'Real-time Sync'],
                links: {
                    github: 'https://github.com/Jaison-Abraham',
                    demo: '#'
                },
                category: 'mobile',
                featured: true
            },
            {
                id: 'wuzzle-game',
                title: 'Wuzzle - Wordle-style Game',
                description: 'iOS game with custom keyboard implementation, dynamic color feedback, and responsive design built with Swift and UIKit.',
                icon: '🎯',
                technologies: ['Swift', 'UIKit', 'Storyboard', 'Game Logic'],
                links: {
                    github: 'https://github.com/Jaison-Abraham',
                    demo: '#'
                },
                category: 'mobile',
                featured: true
            },
            {
                id: 'chill-check',
                title: 'Chill Check - Fridge Tracker',
                description: 'iOS app for tracking food expiry dates with local data storage, filtering capabilities, history logging, and dark mode support.',
                icon: '❄️',
                technologies: ['Swift', 'Xcode', 'Local Storage', 'UI/UX'],
                links: {
                    github: 'https://github.com/Jaison-Abraham',
                    demo: '#'
                },
                category: 'mobile',
                featured: true
            }
        ];
    }

    setupEventListeners() {
        this.filterButtons?.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = button.dataset.filter;
                this.filterProjects(filter);
                this.updateActiveFilter(button);
            });
        });

        document.addEventListener('click', (e) => {
            if (e.target.matches('.project-link[href="#"]')) {
                e.preventDefault();
                this.showProjectModal(e.target.closest('.project-card'));
            }
        });
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.projectObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, index * 100);
                }
            });
        }, observerOptions);
    }

    renderProjects() {
        if (!this.container) {
            console.warn('Projects container not found');
            return;
        }

        this.container.innerHTML = '';
        this.projectCards = [];

        this.filteredProjects.forEach((project, index) => {
            const projectCard = this.createProjectCard(project, index);
            this.container.appendChild(projectCard);
            this.projectCards.push(projectCard);
            
            if (this.projectObserver) {
                this.projectObserver.observe(projectCard);
            }
        });

        if (this.filteredProjects.length === 0) {
            this.container.innerHTML = this.createEmptyState();
        }
    }

    createProjectCard(project, index) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.projectId = project.id;
        card.dataset.category = project.category || 'other';
        
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="project-image">
                <img src="${project.image}" alt="${project.title}">
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    ${project.technologies.map(tech => 
                        `<span class="tech-tag">${tech}</span>`
                    ).join('')}
                </div>
                <div class="project-links">
                    ${project.links.github ? 
                        `<a href="${project.links.github}" class="project-link" target="_blank" rel="noopener">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            View Code
                        </a>` : ''
                    }
                    ${project.links.demo && project.links.demo !== '#' ? 
                        `<a href="${project.links.demo}" class="project-link secondary" target="_blank" rel="noopener">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m18 13 5-5-5-5"/>
                                <path d="M2 19h16"/>
                                <path d="m8 6 5 5-5 5"/>
                            </svg>
                            Live Demo
                        </a>` : 
                        `<a href="#" class="project-link secondary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 3h6v6"/>
                                <path d="m21 3-7 7"/>
                                <path d="M9 21H3v-6"/>
                            </svg>
                            Learn More
                        </a>`
                    }
                </div>
            </div>
        `;

        return card;
    }

    createEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>No projects found</h3>
                <p>No projects match the current filter. Try selecting a different category.</p>
                <button class="btn btn-primary" onclick="window.PortfolioApp.getComponent('projects').filterProjects('all')">
                    Show All Projects
                </button>
            </div>
        `;
    }

    filterProjects(filter) {
        this.currentFilter = filter;
        
        if (filter === 'all') {
            this.filteredProjects = [...this.projects];
        } else {
            this.filteredProjects = this.projects.filter(project => 
                project.category === filter || 
                (project.featured && filter === 'featured')
            );
        }
        
        this.renderProjects();
        this.animateFilter();
    }

    updateActiveFilter(activeButton) {
        this.filterButtons?.forEach(button => {
            button.classList.remove('active');
        });
        activeButton?.classList.add('active');
    }

    animateFilter() {
        this.projectCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    showProjectModal(projectCard) {
        const projectId = projectCard.dataset.projectId;
        const project = this.projects.find(p => p.id === projectId);
        
        if (!project) return;

        // Scroll to contact section for now
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            Utils.scrollToElement(contactSection, 80);
        }
        
        console.log('Show project details for:', project.title);
    }

    getProject(id) {
        return this.projects.find(project => project.id === id);
    }

    getProjectsByCategory(category) {
        return this.projects.filter(project => project.category === category);
    }

    getFeaturedProjects() {
        return this.projects.filter(project => project.featured);
    }

    onResize() {
        this.updateLayout();
    }

    updateLayout() {
        const viewportWidth = window.innerWidth;
        
        if (viewportWidth < 768) {
            this.container?.classList.add('mobile-layout');
        } else {
            this.container?.classList.remove('mobile-layout');
        }
    }

    destroy() {
        if (this.projectObserver) {
            this.projectObserver.disconnect();
        }
        
        this.projects = [];
        this.filteredProjects = [];
        this.projectCards = [];
        
        this.filterButtons?.forEach(button => {
            button.removeEventListener('click', this.handleFilterClick);
        });
        
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}