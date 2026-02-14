// ============================================
// Smooth Navigation & Scroll Effects
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ============================================
// Navbar Background on Scroll
// ============================================

const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.borderBottomColor = 'rgba(42, 51, 66, 0.5)';
    } else {
        navbar.style.borderBottomColor = 'rgb(42, 51, 66)';
    }
});

// ============================================
// Intersection Observer for Animations
// ============================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe project cards and about sections
document.querySelectorAll('.project-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// ============================================
// Active Navigation Link on Scroll
// ============================================

const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.style.color = 'var(--text-secondary)';
        if (link.getAttribute('href').slice(1) === current) {
            link.style.color = 'var(--accent)';
        }
    });
});

// ============================================
// Add Subtle Parallax Effect
// ============================================

const hero = document.querySelector('.hero');
window.addEventListener('scroll', () => {
    if (hero) {
        const scrolled = window.scrollY;
        hero.style.backgroundPosition = `0px ${scrolled * 0.5}px`;
    }
});

// ============================================
// Prevent FOUC (Flash of Unstyled Content)
// ============================================

document.addEventListener('readystatechange', function() {
    if (document.readyState === 'loading') {
        document.body.style.opacity = '0';
    } else if (document.readyState === 'interactive') {
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '1';
    }
});
