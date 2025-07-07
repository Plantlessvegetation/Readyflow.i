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
    const cartTotalEl = document('cart-total'); // Corrected typo here (getElementById)
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
        console.log('--- Starting renderCart function (Final Attempt) ---');
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
        addRemoveListeners(); // This is where listeners are attached after rendering
        console.log('--- renderCart function finished (Final Attempt) ---');
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
        console.log('--- addRemoveListeners function started ---'); // Added debug
        const removeButtons = document.querySelectorAll('.cart-item-remove');
        console.log('Found remove buttons:', removeButtons); // Added debug
        if (removeButtons.length === 0) {
            console.warn('No remove buttons found. Is the selector correct or are items not rendered?'); // Added debug warning
        }
        removeButtons.forEach(button => {
            console.log('Attaching listener to button:', button); // Added debug
            button.addEventListener('click', async (e) => {
                console.log('Remove button clicked!'); // Added debug
                const cartItemElement = e.currentTarget.closest('.cart-item');
                const productId = cartItemElement.dataset.id;
                const upsellId = cartItemElement.dataset.upsellId || 'none';
                console.log(`Attempting to remove Product ID: ${productId}, Upsell ID: ${upsellId}`); // Added debug
                await removeFromCart(productId, upsellId);
            });
        });
        console.log('--- addRemoveListeners function finished ---'); // Added debug
    }

    async function removeFromCart(productId, upsellIdToRemove) {
        console.log(`--- removeFromCart started for Product ID: ${productId}, Upsell ID: ${upsellIdToRemove} ---`); // Added debug
        let cart = await getCart();
        console.log('Cart before removal:', JSON.parse(JSON.stringify(cart))); // Added debug (deep copy to avoid mutation issues in log)
        const updatedCart = cart.filter(item => !(item.id === productId && (item.upsellId || 'none') === upsellIdToRemove));
        console.log('Cart after filter (before update):', JSON.parse(JSON.stringify(updatedCart))); // Added debug

        if (auth.currentUser) {
            const cartRef = doc(db, 'carts', auth.currentUser.uid);
            try {
                if (updatedCart.length > 0) {
                    await setDoc(cartRef, { items: updatedCart });
                    console.log('Firestore: Cart updated with remaining items.'); // Added debug
                } else {
                    await deleteDoc(cartRef);
                    console.log('Firestore: Cart document deleted (cart is now empty).'); // Added debug
                }
                console.log('Item removed from Firestore cart successfully.');
            } catch (error) {
                console.error('Firestore Error removing item from cart:', error); // Added specific error log
                alert('Error removing item. Please check console for details.'); // User feedback
                return;
            }
        } else {
            localStorage.setItem('readyflow_cart', JSON.stringify(updatedCart));
            console.log('LocalStorage: Item removed from localStorage cart.');
        }

        await renderCart();
        await updateCartIcon();
        console.log('--- removeFromCart finished ---'); // Added debug
    }

    // --- Original onAuthStateChanged trigger with corrected pathname check ---
    onAuthStateChanged(auth, async (user) => {
        // Corrected the pathname check to account for Netlify's clean URLs
        if (window.location.pathname.includes('/cart/cart') || window.location.pathname === '/cart/') {
            console.log('Condition met: Calling renderCart() via onAuthStateChanged.');
            await renderCart();
        }
        await updateCartIcon();
    });
});