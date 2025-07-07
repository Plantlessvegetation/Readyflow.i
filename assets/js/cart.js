// This script handles all functionality for the cart.html page.

import { products } from './products.js';
import { getCart, updateCartIcon } from './main.js';
import { auth, db, currentUser } from './login.js';
import { doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
// REMOVE: import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; // This import is no longer needed for this test

import { getUpsellPlanDetails, getUpsellPlanPrice } from './upsell.js';

document.addEventListener('DOMContentLoaded', async () => {
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
        console.log('--- Starting renderCart function (Direct Call Test) ---'); // Modified debug
        console.log('Current cartItemsContainer element:', cartItemsContainer);

        const cart = await getCart();
        console.log('Cart data received for rendering:', cart);

        if (cart.length === 0) {
            console.log('Cart is empty, showing empty message.');
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <p>Your cart is currently empty.</p>
                    <a href="../pages/website-store.html" class="btn btn-primary" style="margin-top: 20px;">Browse Templates</a>
                </div>
            `;
            if(cartSummary) cartSummary.style.display = 'none';
            return;
        }

        let cartHTML = '';
        let subtotal = 0;

        for (const cartItem of cart) {
            console.log('Processing cart item:', cartItem);
            const product = products.find(p => p.id === cartItem.id);
            console.log('Found product details:', product);

            if (product) {
                let itemPrice = 0;
                let itemDescription = product.name;

                if (cartItem.upsellId && cartItem.upsellId !== 'none') {
                    const upsellDetails = getUpsellPlanDetails(cartItem.upsellId);
                    console.log('Upsell details for item:', upsellDetails);
                    if (upsellDetails) {
                        itemPrice = upsellDetails.price;
                        itemDescription = `${product.name} (with ${upsellDetails.name})`;
                    } else {
                        itemPrice = product.price;
                        console.warn(`Upsell details not found for ID: ${cartItem.upsellId}. Using base product price.`);
                    }
                } else {
                    itemPrice = product.price;
                }
                
                subtotal += itemPrice;

                const productDetailPath = `../pages/product-detail.html?id=${product.id}`;
                const productImagePath = product.image.startsWith('http') ? product.image : `../${product.image}`;

                cartHTML += `
                    <div class="cart-item" data-id="${product.id}" data-upsell-id="${cartItem.upsellId || 'none'}">
                        <a href="${productDetailPath}" class="cart-item-img-link">
                            <img src="${productImagePath}" alt="${product.name}" class="cart-item-img" onerror="this.src='https://placehold.co/100x75/1A202C/FFFFFF?text=...'">
                        </a>
                        <div class="cart-item-details">
                            <h3><a href="${productDetailPath}">${itemDescription}</a></h3>
                            <p>₹${itemPrice.toLocaleString('en-IN')}</p>
                        </div>
                        <button class="cart-item-remove" title="Remove item"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                console.log('Generated HTML for item:', cartHTML);
            } else {
                console.error('Product details not found in products.js for cartItem:', cartItem);
            }
        }

        console.log('Final generated cartHTML:', cartHTML);
        cartItemsContainer.innerHTML = cartHTML;
        console.log('cartItemsContainer updated with new HTML.');
        cartSubtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

        handleCouponDisplay(subtotal);

        cartSummary.style.display = 'block';
        addRemoveListeners();
        console.log('--- renderCart function finished (Direct Call Test) ---'); // Modified debug
    }

    function handleCouponDisplay(subtotal) {
        // ... (existing code) ...
    }

    async function applyCoupon() {
        // ... (existing code) ...
    }

    function showLoginModal() {
        // ... (existing code) ...
    }

    function hideLoginModal() {
        // ... (existing code) ...
    }

    if (applyPromoBtn) applyPromoBtn.addEventListener('click', applyCoupon);
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideLoginModal);
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            localStorage.setItem('applied_coupon', COUPON.code);
            window.location.href = '../pages/login.html';
        });
    }

    function addRemoveListeners() {
        // ... (existing code) ...
    }

    async function removeFromCart(productId, upsellIdToRemove) {
        // ... (existing code) ...
    }

    // --- TEMPORARY DEBUGGING CALL ---
    console.log('Current pathname:', window.location.pathname); // ADD THIS LINE
    console.log('Includes "/cart/cart.html":', window.location.pathname.includes('/cart/cart.html')); // ADD THIS LINE

    if (window.location.pathname.includes('/cart/cart.html')) {
        await renderCart(); // Call renderCart directly for testing
    }
    // Note: updateCartIcon is globally handled by main.js's onAuthStateChanged listener.
    // If you need it immediately on cart page load regardless of auth state, you could call it here too.
    // For now, focus on renderCart.
});