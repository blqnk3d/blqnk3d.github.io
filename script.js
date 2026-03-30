// ============================================
// Mobile Navigation Toggle
// ============================================
const mobileToggle = document.querySelector(".mobile-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");

mobileToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  const icon = mobileToggle.querySelector("i");
  if (navLinks.classList.contains("active")) {
    icon.classList.remove("fa-bars");
    icon.classList.add("fa-times");
  } else {
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
  }
});

// Close mobile menu when clicking a link
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navLinks.classList.remove("active");
    mobileToggle.querySelector("i").classList.remove("fa-times");
    mobileToggle.querySelector("i").classList.add("fa-bars");
  });
});

// ============================================
// Typing Effect for Hero
// ============================================
const typingText = document.querySelector(".typing-text");
const phrases = ["Tools.", "Applications.", "Solutions."];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 100;

function type() {
  const currentPhrase = phrases[phraseIndex];

  if (isDeleting) {
    typingText.textContent = currentPhrase.substring(0, charIndex - 1);
    charIndex--;
    typeSpeed = 50;
  } else {
    typingText.textContent = currentPhrase.substring(0, charIndex + 1);
    charIndex++;
    typeSpeed = 100;
  }

  if (!isDeleting && charIndex === currentPhrase.length) {
    isDeleting = true;
    typeSpeed = 2000; // Pause at end
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    typeSpeed = 500; // Pause before new word
  }

  setTimeout(type, typeSpeed);
}

// Start typing effect on load
document.addEventListener("DOMContentLoaded", type);

// ============================================
// Scroll Animations (Intersection Observer)
// ============================================
const observerOptions = {
  threshold: 0.15,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      // Optional: Stop observing once visible
      // observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(".fade-in").forEach((el) => {
  observer.observe(el);
});

// ============================================
// Active Navigation Link on Scroll
// ============================================
const sections = document.querySelectorAll("section");
const navLinksArray = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    // Offset for navbar height
    if (window.scrollY >= sectionTop - 150) {
      current = section.getAttribute("id");
    }
  });

  navLinksArray.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href").slice(1) === current) {
      link.classList.add("active");
    }
  });

  // Navbar Glass Effect Intensity on Scroll
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.style.background = "rgba(11, 13, 23, 0.95)";
    navbar.style.borderBottom = "1px solid var(--accent)";
  } else {
    navbar.style.background = "var(--glass)";
    navbar.style.borderBottom = "1px solid rgba(45, 55, 72, 0.5)";
  }
});

// ============================================
// Dynamic Year in Footer
// ============================================
document.getElementById("year").textContent = new Date().getFullYear();

// ============================================
// Smooth Scroll for Anchor Links (Backup for older browsers)
// ============================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    if (targetId === "#") return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  });
});
