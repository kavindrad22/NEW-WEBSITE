document.addEventListener("DOMContentLoaded", () => {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            // Optional: add slight fade animation via JS or Tailwind classes
        });
    }

    // Navbar background on scroll
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('bg-dark-bg/90', 'backdrop-blur-md', 'shadow-2xl', 'border-b', 'border-gray-800/50');
            navbar.classList.remove('py-6');
            navbar.classList.add('py-4');
        } else {
            navbar.classList.remove('bg-dark-bg/90', 'backdrop-blur-md', 'shadow-2xl', 'border-b', 'border-gray-800/50');
            navbar.classList.add('py-6');
            navbar.classList.remove('py-4');
        }
    });

    // Initialize GSAP
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Standard reveal animation for sections
        const revealElements = gsap.utils.toArray('.gs-reveal');
        
        revealElements.forEach(function(elem) {
            // Hide elements initially
            gsap.set(elem, { autoAlpha: 0, y: 40 });
            
            ScrollTrigger.create({
                trigger: elem,
                start: "top 85%",
                onEnter: function() {
                    gsap.to(elem, { 
                        duration: 1.2, 
                        autoAlpha: 1, 
                        y: 0, 
                        ease: "power3.out",
                        overwrite: "auto"
                    });
                },
                once: true
            });
        });

        // Hero image floating/breathing effect
        const heroImg = document.querySelector('.hero-img');
        if (heroImg) {
            gsap.to(heroImg, {
                scale: 1.05,
                duration: 20,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
    }
});
