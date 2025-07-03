// This script handles sitewide functionality like theme switching and mobile navigation.

document.addEventListener('DOMContentLoaded', () => {

    // --- THEME SWITCHER LOGIC ---
    const themeSwitcher = document.getElementById('theme-switcher');
    if (themeSwitcher) {
        const sunIcon = themeSwitcher.querySelector('.fa-sun');
        const moonIcon = themeSwitcher.querySelector('.fa-moon');
        
        // Function to apply the saved theme on page load
        const applyTheme = (theme) => {
            if (theme === 'light') {
                document.body.classList.add('light-theme');
                if(sunIcon) sunIcon.style.display = 'none';
                if(moonIcon) moonIcon.style.display = 'inline-block';
            } else {
                document.body.classList.remove('light-theme');
                if(sunIcon) sunIcon.style.display = 'inline-block';
                if(moonIcon) moonIcon.style.display = 'none';
            }
        };

        // Check for saved theme in localStorage
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            applyTheme(currentTheme);
        }

        // Add click event to toggle theme
        themeSwitcher.addEventListener('click', () => {
            let theme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
            applyTheme(theme);
        });
    }

    // --- MOBILE NAVIGATION TOGGLE ---
    const navToggleBtn = document.querySelector('.mobile-nav-toggle');
    const mainHeader = document.querySelector('.main-header');
    if (navToggleBtn && mainHeader) {
        navToggleBtn.addEventListener('click', () => {
            mainHeader.classList.toggle('nav-open');
        });
    }

    // --- HEADLINE ANIMATION LOGIC (for homepage) ---
    const headline = document.getElementById('animated-headline');
    if (headline) {
        const words = headline.querySelectorAll('.word');
        let delay = 0.1;
        words.forEach(word => {
            word.style.animationDelay = `${delay}s`;
            delay += 0.15;
        });
        headline.classList.add('animate');
    }

    // --- FAQ ACCORDION LOGIC (for homepage) ---
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                const answer = item.querySelector('.faq-answer');
                const wasActive = item.classList.contains('active');
                
                // Optional: Close other FAQs when one is opened
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.faq-answer').style.maxHeight = null;
                    }
                });

                // Toggle the clicked FAQ
                if (wasActive) {
                    item.classList.remove('active');
                    answer.style.maxHeight = null;
                } else {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        });
    }

    // --- ACTIVE NAV LINK HIGHLIGHTING ---
    const navLinks = document.querySelectorAll('.main-nav a');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
        // Handle homepage link
        if (link.getAttribute('href') === '/index.html' && currentPath === '/index.html') {
            document.querySelector('.home-icon-btn').classList.add('active');
        }
        // Handle other page links
        if (currentPath.includes(link.getAttribute('href')) && link.getAttribute('href') !== '/index.html') {
            link.classList.add('active');
        }
    });
});
