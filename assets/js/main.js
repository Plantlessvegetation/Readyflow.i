// This script handles sitewide functionality like theme switching and mobile navigation.

// Import necessary modules from login.js and Firebase Firestore
import { auth, db, signOut } from './login.js'; // Import signOut
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
        console.log('MAIN.JS: updateCartIcon triggered.');
        console.log('MAIN.JS: Current cartCountElement HTML before update:', cartCountElement.outerHTML);
        // --- END DEBUGGING LOGS ---

        const currentCount = cart.length;
        console.log('MAIN.JS: updateCartIcon - Cart Length (actual from getCart):', currentCount);

        cartCountElement.textContent = String(currentCount); // Explicitly convert to string

        // Hide the cart count bubble if cart is empty, show otherwise
        if (currentCount === 0) {
            cartCountElement.style.display = 'none';
        } else {
            cartCountElement.style.display = 'flex'; // Or 'inline-flex' based on your CSS
        }

        // --- ADDED DEBUGGING LOGS ---
        console.log('MAIN.JS: Current cartCountElement HTML after update:', cartCountElement.outerHTML);
        // --- END DEBUGGING LOGS ---
    }
}


document.addEventListener('DOMContentLoaded', () => {

    // --- NEW USER SIDEBAR ELEMENTS ---
    const userSidebar = document.getElementById('user-sidebar');
    const userProfileToggleBtn = document.getElementById('user-profile-toggle');
    const userSidebarCloseBtn = document.getElementById('user-sidebar-close-btn');
    const userSidebarContent = document.getElementById('user-sidebar-content');
    const pageOverlay = document.getElementById('page-overlay'); // Re-using global overlay

    // --- USER SIDEBAR TOGGLE LOGIC ---
    if (userProfileToggleBtn && userSidebar && userSidebarCloseBtn && pageOverlay) {
        userProfileToggleBtn.addEventListener('click', () => {
            document.body.classList.add('user-sidebar-open');
        });
        userSidebarCloseBtn.addEventListener('click', () => {
            document.body.classList.remove('user-sidebar-open');
        });
        // Close sidebar when clicking overlay
        pageOverlay.addEventListener('click', () => {
            document.body.classList.remove('user-sidebar-open');
            document.body.classList.remove('sidebar-open'); // Also close main mobile nav if open
        });
    }

    // --- RENDER USER SIDEBAR CONTENT (Login/Logout) ---
    async function renderUserSidebarContent(user) {
        if (userSidebarContent) {
            if (user) {
                // User is logged in
                userSidebarContent.innerHTML = `
                    <p>Welcome, ${user.email}</p>
                    <button id="logout-btn" class="btn btn-secondary">Logout</button>
                    <a href="pages/custom-development.html" class="sidebar-link">Custom Development</a>
                    <a href="pages/website-store.html" class="sidebar-link">Template Store</a>
                    <a href="pages/shopify-services.html" class="sidebar-link">Shopify Services</a>
                    <a href="cart/cart.html" class="sidebar-link">My Cart</a>
                    <a href="pages/legal/privacy-policy.html" class="sidebar-link">Privacy Policy</a>
                    <a href="pages/legal/terms-and-conditions.html" class="sidebar-link">Terms & Conditions</a>
                    <a href="pages/legal/refund-policy.html" class="sidebar-link">Refund Policy</a>
                `;
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', async () => {
                        try {
                            await signOut(auth);
                            alert('You have been logged out.');
                            // Optional: Redirect to homepage or refresh
                            window.location.href = '/index.html'; 
                        } catch (error) {
                            console.error('Error logging out:', error);
                            alert('Failed to log out. Please try again.');
                        }
                    });
                }
            } else {
                // User is not logged in (guest)
                userSidebarContent.innerHTML = `
                    <a href="pages/login.html" class="btn btn-primary">Sign In / Sign Up</a>
                    <p style="margin-top: 15px;">Access your profile, orders, and exclusive offers.</p>
                    <a href="pages/custom-development.html" class="sidebar-link">Custom Development</a>
                    <a href="pages/website-store.html" class="sidebar-link">Template Store</a>
                    <a href="pages/shopify-services.html" class="sidebar-link">Shopify Services</a>
                    <a href="cart/cart.html" class="sidebar-link">My Cart</a>
                    <a href="pages/legal/privacy-policy.html" class="sidebar-link">Privacy Policy</a>
                    <a href="pages/legal/terms-and-conditions.html" class="sidebar-link">Terms & Conditions</a>
                    <a href="pages/legal/refund-policy.html" class="sidebar-link">Refund Policy</a>
                `;
            }
        }
    }

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

    // --- MOBILE NAVIGATION TOGGLE (Original Main Nav) ---
    const navToggleBtn = document.querySelector('.mobile-nav-toggle');
    const mainHeader = document.querySelector('.main-header');
    if (navToggleBtn && mainHeader && pageOverlay) {
        navToggleBtn.addEventListener('click', () => {
            document.body.classList.add('sidebar-open'); // Using sidebar-open class for consistency
        });
        // Close is handled by pageOverlay click now
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

    // --- Firebase Auth State Listener (Centralized for main.js and login.js) ---
    // This listener handles updates for both the cart icon and the new user sidebar content.
    auth.onAuthStateChanged(async (user) => {
        console.log('MAIN.JS: onAuthStateChanged - User:', user ? user.email : 'null'); // DEBUGGING LOG
        await updateCartIcon(); // Update cart icon based on logged-in status
        await renderUserSidebarContent(user); // Update user sidebar content
    });
});