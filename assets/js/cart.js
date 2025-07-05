// This script handles all functionality for the cart.html page.

import { products } from './products.js';
import { getCart, updateCartIcon } from './main.js';
import { auth, db, currentUser } from './login.js'; // Import auth, db, currentUser
import { doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js"; // Import Firestore functions
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; // Import onAuthStateChanged
import { upsellPlans, getUpsellPlanPrice } from './upsells.js'; // NEW: Import upsell data and helper

document.addEventListener('DOMContentLoaded', async () => { // Keep async for other event listeners
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
        // --- ADDED CONSOLE.LOGS FOR DEBUGGING ---
        console.log('--- Starting cart render process ---');
        console.log('Am I logged in (auth.currentUser)?', auth.currentUser);
        const cart = await getCart(); // Get the cart data
        console.log('What cart data did I get?', cart);
        console.log('Do I have product details (products)?', products);
        // --- END OF CONSOLE.LOGS ---

        if (cart.length === 0) {
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
        let subtotal = 0; // This is the total for display and final discount calculation

        for (const cartItem of cart) {
            const product = products.find(p => p.id === cartItem.id);
            if (product) {
                let itemPrice = product.price;
                let upsellName = '';

                // NEW: Calculate price based on upsell
                if (cartItem.upsellId && cartItem.upsellId !== 'none') {
                    itemPrice = product.price / 2; // Halve template price
                    const upsellCost = getUpsellPlanPrice(cartItem.upsellId);
                    itemPrice += upsellCost;
                    const upsell = upsellPlans.find(p => p.id === cartItem.upsellId);
                    if (upsell) {
                        upsellName = `<span class="cart-item-upsell-name">(${upsell.name})</span>`;
                    }
                }
                
                subtotal += itemPrice; // Still add the itemPrice after potential upsell calculation

                cartHTML += `
                    <div class="cart-item" data-id="${product.id}" data-upsell-id="${cartItem.upsellId || 'none'}">
                        <a href="../pages/product-detail.html?id=${product.id}" class="cart-item-img-link">
                            <img src="${product.image}" alt="${product.name}" class="cart-item-img" onerror="this.src='https://placehold.co/100x75/1A202C/FFFFFF?text=...'">
                        </a>
                        <div class="cart-item-details">
                            <h3><a href="../pages/product-detail.html?id=${product.id}">${product.name} ${upsellName}</a></h3>
                            <p>₹${itemPrice.toLocaleString('en-IN')}</p>
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
    }

    function handleCouponDisplay(currentCartSubtotal) { // Renamed parameter for clarity
        let total = currentCartSubtotal;
        let discount = 0;
        const appliedCoupon = localStorage.getItem('applied_coupon');

        // NEW: Calculate subtotal for minSpend check, excluding upsell prices
        let subtotalForMinSpendCheck = 0;
        const cartItems = JSON.parse(localStorage.getItem('readyflow_cart')) || []; // Get current cart for calculation

        cartItems.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                if (item.upsellId && item.upsellId !== 'none') {
                    subtotalForMinSpendCheck += product.price / 2; // Add halved template price
                } else {
                    subtotalForMinSpendCheck += product.price; // Add full template price
                }
            }
        });


        if (appliedCoupon === COUPON.code && subtotalForMinSpendCheck >= COUPON.minSpend) { // Use new subtotal for minSpend check
            discount = currentCartSubtotal * COUPON.discount; // Apply discount to full subtotal
            total = currentCartSubtotal - discount;

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

            if (subtotalForMinSpendCheck < COUPON.minSpend) { // Use new subtotal for minSpend check
                const needed = COUPON.minSpend - subtotalForMinSpendCheck;
                promoMessageEl.className = 'promo-message info';
                promoMessageEl.innerHTML = `Add items worth <strong>₹${needed.toLocaleString('en-IN')}</strong> more (excluding add-ons) to use code <strong>${COUPON.code}</strong> for 50% off!`;
            } else {
                promoMessageEl.className = 'promo-message';
                promoMessageEl.textContent = `Have a promo code? Enter it above.`;
            }
        }

        cartTotalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
    }

    async function applyCoupon() {
        const enteredCode = promoCodeInput.value.trim().toUpperCase();
        // The subtotal calculation here needs to reflect the one used in handleCouponDisplay for minSpendCheck
        // We'll duplicate the logic for direct use in this function call, or refactor if needed more broadly.
        let subtotalForMinSpendCheck = 0;
        const cart = await getCart(); // Fetch current cart items
        cart.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                if (item.upsellId && item.upsellId !== 'none') {
                    subtotalForMinSpendCheck += product.price / 2; // Add halved template price
                } else {
                    subtotalForMinSpendCheck += product.price; // Add full template price
                }
            }
        });


        if (enteredCode !== COUPON.code) {
            promoMessageEl.className = 'promo-message error';
            promoMessageEl.textContent = 'Invalid promo code.';
            return;
        }

        if (subtotalForMinSpendCheck < COUPON.minSpend) { // Use subtotalForMinSpendCheck
            promoMessageEl.className = 'promo-message error';
            promoMessageEl.textContent = `You need to spend at least ₹${COUPON.minSpend} (excluding add-ons) to use this code.`;
            return;
        }

        // If eligible, store coupon and trigger login modal
        localStorage.setItem('applied_coupon', COUPON.code);
        showLoginModal();
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
                const upsellId = e.currentTarget.closest('.cart-item').dataset.upsellId || 'none'; // Get upsellId
                await removeFromCart(productId, upsellId); // Pass upsellId to removeFromCart
            });
        });
    }

    async function removeFromCart(productId, upsellIdToRemove) { // Modified to accept upsellId
        let cart = await getCart();
        // Filter out the specific item (product + upsell combination)
        const updatedCart = cart.filter(item => !(item.id === productId && (item.upsellId || 'none') === upsellIdToRemove));

        if (auth.currentUser) { // Use auth.currentUser directly
            // User is logged in, save to Firestore
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
        await updateCartIcon(); // Always update cart icon on auth state change
    }

    // IMPORTANT: Call renderCart and updateCartIcon only after Firebase auth state is known
    // This listener ensures the cart is rendered with the correct data (Firestore or localStorage)
    // as soon as the authentication state is known on the cart page.
    onAuthStateChanged(auth, async (user) => {
        if (window.location.pathname.includes('/cart/cart.html')) {
            await renderCart();
        }
        await updateCartIcon();
    });

    // We are removing the direct call to renderCart from DOMContentLoaded.
    // The onAuthStateChanged listener above is now the primary trigger for rendering the cart
    // on the cart page, ensuring Firebase auth state is known before fetching cart data.
    // REMOVED: if(cartItemsContainer) { await renderCart(); }
});