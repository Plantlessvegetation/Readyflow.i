// This script handles all functionality for the cart.html page.

import { products } from './products.js';
import { getCart, updateCartIcon } from './main.js';
import { auth, db, currentUser } from './login.js';
import { doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
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
        console.log('--- Starting renderCart function ---'); // Added debug
        console.log('Current cartItemsContainer element:', cartItemsContainer); // Added debug

        const cart = await getCart();
        console.log('Cart data received for rendering:', cart); // Added debug

        if (cart.length === 0) {
            console.log('Cart is empty, showing empty message.'); // Added debug
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
            console.log('Processing cart item:', cartItem); // Added debug
            const product = products.find(p => p.id === cartItem.id);
            console.log('Found product details:', product); // Added debug

            if (product) {
                let itemPrice = 0;
                let itemDescription = product.name;

                if (cartItem.upsellId && cartItem.upsellId !== 'none') {
                    const upsellDetails = getUpsellPlanDetails(cartItem.upsellId);
                    console.log('Upsell details for item:', upsellDetails); // Added debug
                    if (upsellDetails) {
                        itemPrice = upsellDetails.price;
                        itemDescription = `${product.name} (with ${upsellDetails.name})`;
                    } else {
                        itemPrice = product.price; // Fallback if upsellDetails not found
                        console.warn(`Upsell details not found for ID: ${cartItem.upsellId}. Using base product price.`); // Added debug warning
                    }
                } else {
                    itemPrice = product.price;
                }
                
                subtotal += itemPrice;

                // Ensure paths are correct based on cart.html's location relative to pages/ and assets/
                const productDetailPath = `../pages/product-detail.html?id=${product.id}`;
                const productImagePath = product.image.startsWith('http') ? product.image : `../${product.image}`; // Adjust for relative paths

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
                console.log('Generated HTML for item:', cartHTML); // Added debug
            } else {
                console.error('Product details not found in products.js for cartItem:', cartItem); // Added debug
            }
        }

        console.log('Final generated cartHTML:', cartHTML); // Added debug
        cartItemsContainer.innerHTML = cartHTML;
        console.log('cartItemsContainer updated with new HTML.'); // Added debug
        cartSubtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

        handleCouponDisplay(subtotal);

        cartSummary.style.display = 'block';
        addRemoveListeners();
        console.log('--- renderCart function finished ---'); // Added debug
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
                const upsellId = cartItemElement.dataset.upsellId || 'none';
                await removeFromCart(productId, upsellId);
            });
        });
    }

    async function removeFromCart(productId, upsellIdToRemove) {
        let cart = await getCart();
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

    onAuthStateChanged(auth, async (user) => {
        if (window.location.pathname.includes('/cart/cart.html')) {
            await renderCart();
        }
        await updateCartIcon();
    });
});