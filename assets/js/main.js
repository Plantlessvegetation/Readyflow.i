// This script handles sitewide functionality like theme switching and mobile navigation.

// Import necessary modules from login.js and Firebase Firestore
import { auth, db } from './login.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// --- CART LOGIC ---
// Make getCart async as it will interact with Firestore
export async function getCart() {
    if (auth.currentUser) {
        // User is logged in, try to get cart from Firestore
        const cartRef = doc(db, 'carts', auth.currentUser.uid);
        try {
            const docSnap = await getDoc(cartRef);
            if (docSnap.exists()) {
                return docSnap.data().items || [];
            }
        } catch (error) {
            console.error('Error fetching cart from Firestore:', error);
        }
        return []; // Return empty if error or no doc
    } else {
        // User is not logged in, get cart from localStorage
        return JSON.parse(localStorage.getItem('readyflow_cart')) || [];
    }
}

export async function updateCartIcon() {
    const cart = await getCart();
    const cartCountElement = document.getElementById('cart-item-count');

    if (cartCountElement) {
        // --- ADDED DEBUGGING LOGS ---
        console.log('DEBUG: updateCartIcon triggered.');
        console.log('DEBUG: Current cartCountElement HTML before update:', cartCountElement.outerHTML);
        // --- END DEBUGGING LOGS ---

        const currentCount = cart.length;
        console.log('DEBUG: updateCartIcon - Cart Length (actual from getCart):', currentCount);

        cartCountElement.textContent = String(currentCount); // Explicitly convert to string

        // Hide the cart count bubble if cart is empty, show otherwise
        if (currentCount === 0) {
            cartCountElement.style.display = 'none';
        } else {
            cartCountElement.style.display = 'flex'; // Or 'inline-flex' based on your CSS
        }

        // --- ADDED DEBUGGING LOGS ---
        console.log('DEBUG: Current cartCountElement HTML after update:', cartCountElement.outerHTML);
        // --- END DEBUGGING LOGS ---
    }
}

// --- LOGIN BUTTON VISIBILITY LOGIC ---
export function updateLoginButtonVisibility() {
    const loginButton = document.getElementById('login-signup-btn');
    if (loginButton) {
        // Check Firebase authentication state. `auth.currentUser` is null if no user is logged in.
        if (auth.currentUser) {
            loginButton.style.display = 'none'; // Hide if logged in
        } else {
            loginButton.style.display = 'inline-flex'; // Show if logged out
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // updateCartIcon(); // This initial call is now handled by login.js onAuthStateChanged
    // updateLoginButtonVisibility(); // This initial call is now handled by login.js onAuthStateChanged

    // --- THEME SWITCHER LOGIC ---
    const themeSwitcher = document.getElementById('theme-switcher');
    if (themeSwitcher) {
        const sunIcon = themeSwitcher.querySelector('.fa-sun');
        const moonIcon = themeSwitcher.querySelector('.fa-moon');

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

        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            applyTheme(currentTheme);
        }

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

                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.faq-answer').style.maxHeight = null;
                    }
                });

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
        if (link.getAttribute('href') === '/index.html' && (currentPath === '/index.html' || currentPath === '/')) {
             document.querySelector('.home-icon-btn').classList.add('active');
        }
        if (currentPath.includes(link.getAttribute('href')) && link.getAttribute('href') !== '/index.html') {
            link.classList.add('active');
        }
    });

});