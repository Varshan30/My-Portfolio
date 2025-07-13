// Portfolio JavaScript - Modern Liquid Design

class PortfolioApp {
    constructor() {
        this.init();
        this.bindEvents();
        this.initParticleSystem();
        this.initScrollAnimations();
        this.initProjectFilters();
        console.log("Portfolio app initialized successfully");
    }

    init() {
        // Set initial states
        this.isLoading = false;
        this.currentFilter = 'all';
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        
        // Get canvas context
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        
        // Resize canvas
        this.resizeCanvas();
        
        // Initialize morphing blob mouse tracking
        this.initMouseTracking();
        
        console.log("App initialization complete");
    }

    bindEvents() {
        // Window events
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Navigation events
        const navLinks = document.querySelectorAll('.dock-item');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });
        
        // Form events
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Modal events
        const modal = document.getElementById('projectModal');
        const modalClose = document.querySelector('.modal-close');
        if (modal && modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal();
            });
        }
        
        // Smooth scroll for buttons
        const scrollButtons = document.querySelectorAll('[onclick^="scrollToSection"]');
        scrollButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = button.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.scrollToSection(targetId);
            });
        });
        
        console.log("Event listeners bound");
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Reinitialize particles on resize
        this.initParticles();
    }

    initMouseTracking() {
        const morphingBlob = document.querySelector('.morphing-blob');
        if (!morphingBlob) return;
        
        document.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            
            const x = (clientX - innerWidth / 2) * 0.02;
            const y = (clientY - innerHeight / 2) * 0.02;
            
            morphingBlob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        });
    }

    initParticleSystem() {
        if (!this.ctx) return;
        
        this.initParticles();
        this.animateParticles();
        
        console.log("Particle system initialized");
    }

    initParticles() {
        if (!this.canvas) return;
        
        this.particles = [];
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        const colors = ['#6366f1', '#8b5cf6', '#06b6d4'];
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.5 + 0.2,
                pulseSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }

    animateParticles() {
        if (!this.ctx || !this.canvas) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach((particle, index) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Pulse effect
            particle.alpha += Math.sin(Date.now() * particle.pulseSpeed) * 0.01;
            particle.alpha = Math.max(0.1, Math.min(0.7, particle.alpha));
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fill();
            
            // Draw connections
            this.particles.forEach((otherParticle, otherIndex) => {
                if (index !== otherIndex) {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 150) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(particle.x, particle.y);
                        this.ctx.lineTo(otherParticle.x, otherParticle.y);
                        this.ctx.strokeStyle = particle.color;
                        this.ctx.globalAlpha = (150 - distance) / 150 * 0.2;
                        this.ctx.lineWidth = 1;
                        this.ctx.stroke();
                    }
                }
            });
        });
        
        this.ctx.globalAlpha = 1;
        requestAnimationFrame(() => this.animateParticles());
    }

    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        
        // Add mouse interaction to particles
        if (this.particles.length > 0) {
            this.particles.forEach(particle => {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    particle.vx += (dx / distance) * force * 0.01;
                    particle.vy += (dy / distance) * force * 0.01;
                    
                    // Limit velocity
                    const maxVel = 2;
                    particle.vx = Math.max(-maxVel, Math.min(maxVel, particle.vx));
                    particle.vy = Math.max(-maxVel, Math.min(maxVel, particle.vy));
                }
            });
        }
    }

    initScrollAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fade-in-up 0.8s ease forwards';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const animatedElements = document.querySelectorAll('.section-header, .about-content, .project-card, .contact-content');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            observer.observe(el);
        });
        
        console.log("Scroll animations initialized");
    }

    handleScroll() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        
        // Update active navigation item
        const sections = document.querySelectorAll('section');
        const navItems = document.querySelectorAll('.dock-item');
        
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top + scrollTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollTop >= sectionTop - 200 && scrollTop < sectionTop + sectionHeight - 200) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentSection}`) {
                item.classList.add('active');
            }
        });
        
        // Parallax effect for floating shapes
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.2);
            const yPos = -(scrollTop * speed);
            shape.style.transform = `translateY(${yPos}px)`;
        });
    }

    handleNavClick(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href').substring(1);
        this.scrollToSection(targetId);
        
        console.log(`Navigating to section: ${targetId}`);
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offsetTop = section.getBoundingClientRect().top + window.pageYOffset - 80;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            console.log(`Scrolled to section: ${sectionId}`);
        }
    }

    initProjectFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Filter projects
                this.filterProjects(filter);
                
                console.log(`Applied filter: ${filter}`);
            });
        });
        
        console.log("Project filters initialized");
    }

    filterProjects(filter) {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                card.style.display = 'block';
                card.style.animation = 'fade-in 0.5s ease forwards';
            } else {
                card.style.animation = 'fade-out 0.3s ease forwards';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
        
        this.currentFilter = filter;
    }

    openProject(projectId) {
        const modal = document.getElementById('projectModal');
        const modalContent = document.getElementById('modalContent');
        
        if (!modal || !modalContent) return;
        
        // Project data (in a real app, this would come from an API)
        const projects = {
            project2: {
                title: 'Hotel Booking Platform',
                description: 'A modern hotel booking solution built with React and Node.js, featuring advanced animations and a seamless user experience.',
                technologies: ['HTML', 'CSS', 'JavaScript', 'MySQL', 'Express.js'],
                features: [
                    'Responsive design with mobile-first approach',
                    'Advanced product filtering and search',
                    'Smooth animations and micro-interactions'
                ],
                demoUrl: '#',
                githubUrl: '#'
            },
            project1: {
                title: 'NLC INDIA Maintenance Website',
                description: 'A comprehensive maintenance website for NLC India, featuring a user-friendly interface and robust functionality.',
                technologies: ['HTML', 'CSS', 'JavaScript', 'MySQL', 'Flask'],
                features: [
                    'Secure Authentication System',
                    'Dashboard Homepage',
                    'Department Maintenance Module',
                    'Progress Submission & Locking',
                    'Contractor Management',
                    'Progress Prediction Engine',
                ],
                demoUrl: '#',
                githubUrl: '#'
            },
            project3: {
                title: 'Face recognition and detection',
                description: 'A comprehensive face recognition and detection system using advanced machine learning techniques.',
                technologies: ['Python', 'OpenCV', 'TensorFlow', 'Keras'],
                features: [
                    'Automated Timestamp Extraction',
                    'Real-Time or Batch Video Processing',
                    'AI-Powered Face Embedding and Matching',
                    'Visual Alerts with Matched Frames',
                    'Threshold-Based Similarity Control'
                ],
                demoUrl: '#',
                githubUrl: 'https://github.com/Varshan30/Face-detection-opencv'
            },
            project4: {
                title: 'Hospital Management System',
                description: 'A comprehensive hospital management system with advanced features for patient and staff management.',
                technologies: ['HTML', 'CSS', 'JavaScript', 'MySQL', 'Flask'],
                features: [
                    'Secure Authentication System',
                    'Dashboard Homepage',
                    'Department Wise Module',
                    'Progress Submission & Locking',
                    'Appointment Management',
                ],
                demoUrl: '#',
                githubUrl: '#'
            },
        };
        
        const project = projects[projectId];
        if (!project) return;
        
        modalContent.innerHTML = `
            <h2 class="gradient-text" style="margin-bottom: 1rem; font-size: 2rem;">${project.title}</h2>
            <p style="margin-bottom: 2rem; color: rgba(241, 245, 249, 0.8); line-height: 1.6;">${project.description}</p>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem; color: var(--color-cyan);">Technologies Used</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${project.technologies.map(tech => `
                        <span style="padding: 0.5rem 1rem; background: rgba(99, 102, 241, 0.2); color: var(--color-cyan); border-radius: 1rem; font-size: 0.875rem;">${tech}</span>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem; color: var(--color-cyan);">Key Features</h3>
                <ul style="list-style: none; padding: 0;">
                    ${project.features.map(feature => `
                        <li style="margin-bottom: 0.5rem; color: rgba(241, 245, 249, 0.8); display: flex; align-items: center;">
                            <span style="color: var(--color-electric); margin-right: 0.5rem;">✓</span>
                            ${feature}
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                <a href="${project.demoUrl}" class="btn-primary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-external-link-alt"></i>
                    Live Demo
                </a>
                <a href="${project.githubUrl}" class="btn-secondary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem;">
                    <i class="fab fa-github"></i>
                    View Code
                </a>
            </div>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        console.log(`Opened project modal: ${projectId}`);
    }

    closeModal() {
        const modal = document.getElementById('projectModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            console.log("Closed project modal");
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitButton.disabled = true;
        
        // Submit to Formspree
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                // Success
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                
                this.showNotification(`Thank you ${data.name}! Your message has been sent successfully.`, 'success');
                form.reset();
                
                console.log("Form submitted successfully to Formspree");
            } else {
                throw new Error('Form submission failed');
            }
        })
        .catch(error => {
            console.error('Form submission error:', error);
            
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            // Show error message
            this.showNotification('Sorry, there was an error sending your message. Please try again or email me directly.', 'error');
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        let backgroundColor;
        switch(type) {
            case 'success':
                backgroundColor = 'rgba(34, 197, 94, 0.9)';
                break;
            case 'error':
                backgroundColor = 'rgba(239, 68, 68, 0.9)';
                break;
            default:
                backgroundColor = 'rgba(99, 102, 241, 0.9)';
        }
        
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            padding: 1rem 1.5rem;
            background: ${backgroundColor};
            color: white;
            border-radius: 0.5rem;
            backdrop-filter: blur(20px);
            z-index: 10001;
            animation: slide-in-right 0.3s ease forwards;
            font-weight: 500;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            max-width: 350px;
            line-height: 1.4;
        `;
        notification.textContent = message;
        
        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slide-in-right {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slide-out-right {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds (longer for error messages)
        const timeout = type === 'error' ? 7000 : 4000;
        setTimeout(() => {
            notification.style.animation = 'slide-out-right 0.3s ease forwards';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
                if (document.head.contains(style)) {
                    document.head.removeChild(style);
                }
            }, 300);
        }, timeout);
        
        console.log(`Notification shown: ${message}`);
    }

    // Tech stack hover effects
    initTechStackEffects() {
        const techItems = document.querySelectorAll('.tech-item');
        
        techItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const tech = item.getAttribute('data-tech');
                console.log(`Hovering over tech: ${tech}`);
                
                // Add glow effect
                item.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.6)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.boxShadow = 'none';
            });
        });
    }
}

// Utility functions
function scrollToSection(sectionId) {
    if (window.portfolioApp) {
        window.portfolioApp.scrollToSection(sectionId);
    }
}

function openProject(projectId) {
    if (window.portfolioApp) {
        window.portfolioApp.openProject(projectId);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing portfolio app");
    window.portfolioApp = new PortfolioApp();
    
    // Initialize additional effects
    window.portfolioApp.initTechStackEffects();
    
    // Add some fun console messages
    console.log("%c🚀 Portfolio loaded!", "color: #6366f1; font-size: 20px; font-weight: bold;");
    console.log("%cHi there! 👋 Thanks for checking out the console. Feel free to explore the code!", "color: #8b5cf6; font-size: 14px;");
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log("Page hidden - pausing animations");
        // Pause expensive animations when page is not visible
    } else {
        console.log("Page visible - resuming animations");
        // Resume animations when page becomes visible
    }
});

// Error handling
window.addEventListener('error', (e) => {
    console.error("Portfolio error:", e.error);
});

// Performance monitoring
window.addEventListener('load', () => {
    setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log(`Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
    }, 0);
});

console.log("Portfolio script loaded successfully");
