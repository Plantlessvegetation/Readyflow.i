// This script handles all functionality for the cart.html page.

// REMOVED: import { products } from '/assets/js/products.js'; // Products will now be accessed via window.products

import { getCart, updateCartIcon } from './main.js';
import { auth, db, currentUser } from './login.js';
import { doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Access products from global scope - add defensive check
const products = (typeof window !== 'undefined' && window.products) ? window.products : [];

console.log('CART.JS: File has started executing (final version with global products).'); 
console.log('CART.JS: Initial check - products from window:', products); // New diagnostic log

document.addEventListener('DOMContentLoaded', async () => {
    console.log('CART.JS: DOMContentLoaded event fired (final version with global products).');

    // Make sure products is defined before proceeding, as it's critical
    if (!products || products.length === 0) {
        console.error('CART.JS: ERROR! products array is empty or UNDEFINED. Product data is not available globally.');
        const cartItemsContainer = document.getElementById('cart-items-container');
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <p>Error: Product data could not be loaded. Please ensure products.js is correctly loaded.</p>
                    <a href="../pages/website-store.html" class="btn btn-primary" style="margin-top: 20px;">Browse Templates</a>
                </div>
            `;
        }
        return; // Stop execution if products is critically missing
    }


    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSummary = document.getElementById('cart-summary');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartTotalEl = document.getElementById('cart-total');
    const discountRow = document.getElementById('discount-row');
    const cartDiscountEl = document.getElementById('cart-discount');
    const promoCodeInput = document.getElementById('promo-code-input');
    const applyPromoBtn = document.getElementById('apply-promo-btn');
    const promoMessageEl = document.getElementById('promo-message');

    const loginModal = document.getElementById('login-prompt-modal');
    const closeModalBtn = document.getElementById('modal-close-btn');
    const continueBtn = document.getElementById('modal-continue-btn');

    const COUPON = {
        code: 'READY50',
        discount: 0.50, // 50%
        minSpend: 999
    };

    async function renderCart() {
        console.log('CART.JS: renderCart() started.'); 
        console.log('CART.JS: Current auth.currentUser:', auth.currentUser ? auth.currentUser.email : 'Not logged in');
        
        const cart = await getCart(); // Get the cart data
        console.log('CART.JS: Cart data retrieved from getCart():', cart);

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <p>Your cart is currently empty.</p>
                    <a href="../pages/website-store.html" class="btn btn-primary" style="margin-top: 20px;">Browse Templates</a>
                </div>
            `;
            if(cartSummary) cartSummary.style.display = 'none';
            console.log('CART.JS: Cart is empty, displayed empty message.');
            return;
        }

        console.log('CART.JS: Cart is NOT empty. Number of items:', cart.length);
        console.log('CART.JS: Products array available to cart.js (after window access):', products); 

        let cartHTML = '';
        let subtotal = 0;

        for (const cartItem of cart) {
            console.log('CART.JS: Processing cart item:', cartItem);
            const product = products.find(p => p.id === cartItem.id); 
            
            console.log('CART.JS: Found product for cart item:', product);

            if (product) {
                subtotal += product.price;
                cartHTML += `
                    <div class="cart-item" data-id="${product.id}">
                        <a href="../pages/product-detail.html?id=${product.id}" class="cart-item-img-link">
                            <img src="${product.image}" alt="${product.name}" class="cart-item-img" onerror="this.src='https://placehold.co/100x75/1A202C/FFFFFF?text=Image+Error'">
                        </a>
                        <div class="cart-item-details">
                            <h3><a href="../pages/product-detail.html?id=${product.id}">${product.name}</a></h3>
                            <p>₹${product.price}</p>
                        </div>
                        <button class="cart-item-remove" title="Remove item"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                console.log('CART.JS: Successfully added HTML for product:', product.name);
            } else {
                console.warn('CART.JS: Product details not found for cart item ID (check products.js content or ID match):', cartItem.id);
                cartHTML += `
                    <div class="cart-item" data-id="${cartItem.id}">
                        <div class="cart-item-img-link">
                            <img src="https://placehold.co/100x75/1A202C/FFFFFF?text=Product+Missing" alt="Missing Product" class="cart-item-img">
                        </div>
                        <div class="cart-item-details">
                            <h3>Missing Product (ID: ${cartItem.id})</h3>
                            <p>Price: N/A</p>
                        </div>
                        <button class="cart-item-remove" title="Remove item"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
            }
        }

        cartItemsContainer.innerHTML = cartHTML;
        cartSubtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

        handleCouponDisplay(subtotal);

        cartSummary.style.display = 'block';
        addRemoveListeners();
        console.log('CART.JS: Final HTML injected into cart-items-container. Length:', cartHTML.length);
    }

    function handleCouponDisplay(subtotal) {
        let total = subtotal;
        let discount = 0;
        const appliedCoupon = localStorage.getItem('applied_coupon');

        if (appliedCoupon === COUPON.code && subtotal >= COUPON.minSpend) {
            discount = subtotal * COUPON.discount;
            total = subtotal - discount;

            promoMessageEl.className = 'promo-message success';
            promoMessageEl.textContent = `Success! "${COUPON.code}" applied.`;
            discountRow.style.display = 'flex';
            cartDiscountEl.textContent = `-₹${discount.toLocaleString('en-IN')}`;
            promoCodeInput.value = COUPON.code;
            promoCodeInput.disabled = true;
            applyPromoBtn.disabled = true;
        } else {
            localStorage.removeItem('applied_coupon');
            discountRow.style.display = 'none';
            promoCodeInput.value = '';
            promoCodeInput.disabled = false;
            applyPromoBtn.disabled = false;

            if (subtotal < COUPON.minSpend) {
                const needed = COUPON.minSpend - subtotal;
                promoMessageEl.className = 'promo-message info';
                promoMessageEl.innerHTML = `Add items worth <strong>₹${needed.toLocaleString('en-IN')}</strong> more to use code <strong>${COUPON.code}</strong> for 50% off!`;
            } else {
                promoMessageEl.className = 'promo-message';
                promoMessageEl.textContent = `Have a promo code? Enter it above.`;
            }
        }

        cartTotalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
    }

    async function applyCoupon() {
        const enteredCode = promoCodeInput.value.trim().toUpperCase();
        // Access products from window object
        const subtotal = (await getCart()).reduce((acc, item) => {
            const product = window.products.find(p => p.id === item.id); // Use window.products
            return acc + (product ? product.price : 0);
        }, 0);

        if (enteredCode !== COUPON.code) {
            promoMessageEl.className = 'promo-message error';
            promoMessageEl.textContent = 'Invalid promo code.';
            return;
        }

        if (subtotal < COUPON.minSpend) {
            promoMessageEl.className = 'promo-message error';
            promoMessageEl.textContent = `You need to spend at least ₹${COUPON.minSpend} to use this code.`;
            return;
        }

        // Check if the user is already logged in using Firebase auth
        if (auth.currentUser) {
            // User is logged in, directly apply the coupon
            localStorage.setItem('applied_coupon', COUPON.code);
            await renderCart(); // Re-render cart to show applied discount and update totals
            promoMessageEl.className = 'promo-message success';
            promoMessageEl.textContent = `Success! "${COUPON.code}" applied.`;
            promoCodeInput.disabled = true;
            applyPromoBtn.disabled = true;
        } else {
            // User is not logged in, prompt them to login
            showLoginModal();
        }
    }

    function showLoginModal() {
        if (loginModal) loginModal.classList.add('show');
    }

    function hideLoginModal() {
        if (loginModal) loginModal.classList.remove('show');
    }

    // --- Event Listeners ---
    if (applyPromoBtn) applyPromoBtn.addEventListener('click', applyCoupon);
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideLoginModal);
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            localStorage.setItem('applied_coupon', COUPON.code);
            window.location.href = '../pages/login.html';
        });
    }

    function addRemoveListeners() {
        const removeButtons = document.querySelectorAll('.cart-item-remove');
        removeButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const productId = e.currentTarget.closest('.cart-item').dataset.id;
                await removeFromCart(productId);
            });
        });
    }

    async function removeFromCart(productId) {
        let cart = await getCart();
        const updatedCart = cart.filter(item => item.id !== productId);

        if (auth.currentUser) {
            const cartRef = doc(db, 'carts', auth.currentUser.uid);
            try {
                if (updatedCart.length > 0) {
                    await setDoc(cartRef, { items: updatedCart });
                } else {
                    await deleteDoc(cartRef);
                }
                console.log('Item removed from Firestore cart.');
            } catch (error) {
                console.error('Error removing item from Firestore cart:', error);
                return;
            }
        } else {
            localStorage.setItem('readyflow_cart', JSON.stringify(updatedCart));
            console.log('Item removed from localStorage cart.');
        }

        await renderCart();
        await updateCartIcon();
    }

    // IMPORTANT: Call renderCart and updateCartIcon only after Firebase auth state is known
    // This listener ensures the cart is rendered with the correct data (Firestore or localStorage)
    // as soon as the authentication state is known on the cart page.
    onAuthStateChanged(auth, async (user) => {
        if (window.location.pathname.includes('/cart/cart.html')) {
            await renderCart();
        }
        await updateCartIcon(); // Always update cart icon on auth state change
    });
});