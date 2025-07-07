// This script handles all functionality for the cart.html page.

import { products } from './products.js';
import { getCart, updateCartIcon } from './main.js';
import { auth, db, currentUser } from './login.js'; // Import auth, db, currentUser
import { doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js"; // Import Firestore functions
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; // Import onAuthStateChanged
import { getUpsellPlanDetails, getUpsellPlanPrice } from './upsell.js'; // Import upsell logic

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
        let subtotal = 0;

        for (const cartItem of cart) {
            const product = products.find(p => p.id === cartItem.id);
            if (product) {
                let itemPrice = 0;
                let itemDescription = product.name;

                if (cartItem.upsellId && cartItem.upsellId !== 'none') {
                    const upsellDetails = getUpsellPlanDetails(cartItem.upsellId);
                    if (upsellDetails) {
                        itemPrice = upsellDetails.price; // Only upsell price when bundle is chosen
                        itemDescription = `${product.name} (with ${upsellDetails.name})`;
                    } else {
                        // Fallback if upsellDetails not found, use original product price
                        itemPrice = product.price;
                    }
                } else {
                    itemPrice = product.price; // Original product price if no upsell or 'none'
                }
                
                subtotal += itemPrice;

                cartHTML += `
                    <div class="cart-item" data-id="${product.id}" data-upsell-id="${cartItem.upsellId || 'none'}">
                        <a href="../pages/product-detail.html?id=${product.id}" class="cart-item-img-link">
                            <img src="${product.image}" alt="${product.name}" class="cart-item-img" onerror="this.src='https://placehold.co/100x75/1A202C/FFFFFF?text=...'">
                        </a>
                        <div class="cart-item-details">
                            <h3><a href="../pages/product-detail.html?id=${product.id}">${itemDescription}</a></h3>
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
        // Recalculate subtotal using the new logic for coupon application
        const subtotal = (await getCart()).reduce((acc, item) => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                if (item.upsellId && item.upsellId !== 'none') {
                    const upsellDetails = getUpsellPlanDetails(item.upsellId);
                    return acc + (upsellDetails ? upsellDetails.price : 0);
                } else {
                    return acc + product.price;
                }
            }
            return acc;
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
                const cartItemElement = e.currentTarget.closest('.cart-item');
                const productId = cartItemElement.dataset.id;
                const upsellId = cartItemElement.dataset.upsellId || 'none'; // Get upsellId for specific removal
                await removeFromCart(productId, upsellId); // Pass upsellId to removeFromCart
            });
        });
    }

    async function removeFromCart(productId, upsellIdToRemove) {
        let cart = await getCart();
        // Filter based on both productId and upsellId to remove specific item-upsell combo
        const updatedCart = cart.filter(item => !(item.id === productId && (item.upsellId || 'none') === upsellIdToRemove));

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

    // We are removing the direct call to renderCart from DOMContentLoaded.
    // The onAuthStateChanged listener above is now the primary trigger for rendering the cart
    // on the cart page, ensuring Firebase auth state is known before fetching cart data.
    // REMOVED: if(cartItemsContainer) { await renderCart(); }
});