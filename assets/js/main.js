document.addEventListener('DOMContentLoaded', () => {

    // --- MOBILE NAVIGATION TOGGLE ---
    const navToggleBtn = document.querySelector('.mobile-nav-toggle');
    const mainHeader = document.querySelector('.main-header');

    if (navToggleBtn && mainHeader) {
        navToggleBtn.addEventListener('click', () => {
            mainHeader.classList.toggle('nav-open');
        });
    }

    // --- HEADLINE ANIMATION LOGIC ---
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

    // --- FAQ ACCORDION LOGIC ---
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                const answer = item.querySelector('.faq-answer');
                const wasActive = item.classList.contains('active');
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.faq-answer').style.maxHeight = 0;
                    }
                });
                if (wasActive) {
                    item.classList.remove('active');
                    answer.style.maxHeight = 0;
                } else {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        });
    }

});
