// Smooth scroll for anchor links
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

// Intersection Observer for scroll animations
const observerOptions = {
	threshold: 0.1,
	rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			entry.target.style.opacity = '1';
			entry.target.style.transform = 'translateY(0)';
		}
	});
}, observerOptions);

// Observe all cards and elements
document.querySelectorAll('.feature-card, .vehicle-card, .service-item, .stat, .project-card').forEach(el => {
	el.style.opacity = '0';
	el.style.transform = 'translateY(30px)';
	el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
	observer.observe(el);
});

// Contact form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
	contactForm.addEventListener('submit', function(e) {
		e.preventDefault();
		alert('Thanks for reaching out! I\'ll get back to you soon.');
		this.reset();
	});
}

// Active navigation link tracking on scroll
window.addEventListener('scroll', () => {
	let current = '';
	const sections = document.querySelectorAll('section[id]');
	
	sections.forEach(section => {
		const sectionTop = section.offsetTop;
		const sectionHeight = section.clientHeight;
		if (pageYOffset >= sectionTop - 200) {
			current = section.getAttribute('id');
		}
	});

	document.querySelectorAll('.nav-menu a').forEach(link => {
		link.style.opacity = '0.7';
		if (link.getAttribute('href').slice(1) === current) {
			link.style.opacity = '1';
		}
	});
});

console.log('Developer Portfolio Loaded ✓');
	sections.forEach(section => {
		const sectionTop = section.offsetTop;
		if (window.pageYOffset >= sectionTop - 200) {
			current = section.getAttribute('id');
		}
	});

	navLinks.forEach(link => {
		link.style.opacity = '0.7';
		if (link.getAttribute('href') === `#${current}`) {
			link.style.opacity = '1';
			link.style.fontWeight = '700';
		}
	});


