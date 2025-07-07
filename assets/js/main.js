// This script handles sitewide functionality like theme switching and mobile navigation.

// Import necessary modules from login.js and Firebase Firestore
import { auth, db } from './login.js'; // Ensure auth and db are imported
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; // Import onAuthStateChanged and signOut

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
        console.log('DEBUG: updateCartIcon triggered.');
        console.log('DEBUG: Current cartCountElement HTML before update:', cartCountElement.outerHTML);

        const currentCount = cart.length;
        console.log('DEBUG: updateCartIcon - Cart Length (actual from getCart):', currentCount);

        cartCountElement.textContent = String(currentCount);

        if (currentCount === 0) {
            cartCountElement.style.display = 'none';
        } else {
            cartCountElement.style.display = 'flex';
        }

        console.log('DEBUG: Current cartCountElement HTML after update:', cartCountElement.outerHTML);
    }
}


document.addEventListener('DOMContentLoaded', () => {
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

    // --- NEW ACCOUNT SIDEBAR LOGIC ---
    const accountToggleBtn = document.getElementById('account-toggle');
    const accountSidebarOverlay = document.getElementById('account-sidebar-overlay');
    const accountSidebar = document.getElementById('account-sidebar');
    const accountSidebarCloseBtn = document.getElementById('account-sidebar-close-btn');
    const accountLoggedOutSection = document.getElementById('account-sidebar-logged-out');
    const accountLoggedInSection = document.getElementById('account-sidebar-logged-in');
    const userDisplayName = document.getElementById('user-display-name');
    const logoutBtn = document.getElementById('logout-btn');

    if (accountToggleBtn && accountSidebarOverlay && accountSidebar && accountSidebarCloseBtn) {
        const closeAccountSidebar = () => {
            document.body.classList.remove('account-sidebar-open');
        };

        accountToggleBtn.addEventListener('click', () => {
            // Close mobile nav if open
            mainHeader.classList.remove('nav-open');
            document.body.classList.toggle('account-sidebar-open');
        });

        accountSidebarCloseBtn.addEventListener('click', closeAccountSidebar);
        accountSidebarOverlay.addEventListener('click', (e) => {
            if (e.target === accountSidebarOverlay) {
                closeAccountSidebar();
            }
        });

        // Logout functionality
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await signOut(auth);
                    console.log('User signed out successfully.');
                    // The onAuthStateChanged listener will handle UI update
                    closeAccountSidebar(); // Close sidebar after logout
                } catch (error) {
                    console.error('Error signing out:', error);
                    alert('Error signing out: ' + error.message);
                }
            });
        }
    }

    // --- CENTRALIZED onAuthStateChanged LISTENER FOR HEADER UI ---
    onAuthStateChanged(auth, async (user) => {
        console.log('onAuthStateChanged triggered in main.js:', user ? user.uid : 'logged out'); // Debugging

        if (user) {
            // User is logged in
            accountLoggedOutSection?.classList.add('hidden');
            accountLoggedInSection?.classList.remove('hidden');
            userDisplayName.textContent = user.displayName || user.email || 'User'; // Prioritize display name, then email
        } else {
            // User is logged out
            accountLoggedOutSection?.classList.remove('hidden');
            accountLoggedInSection?.classList.add('hidden');
        }
        
        // This ensures the cart icon updates globally based on auth state
        await updateCartIcon(); 
    });

});