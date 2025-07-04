// This script handles all functionality for the cart.html page.

document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSummary = document.getElementById('cart-summary');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartTotalEl = document.getElementById('cart-total');
    const discountRow = document.getElementById('discount-row');
    const cartDiscountEl = document.getElementById('cart-discount');
    const promoCodeInput = document.getElementById('promo-code-input');
    const applyPromoBtn = document.getElementById('apply-promo-btn');
    const promoMessageEl = document.getElementById('promo-message');
    
    // --- Modal Elements ---
    const loginModal = document.getElementById('login-prompt-modal');
    const closeModalBtn = document.getElementById('modal-close-btn');
    const continueBtn = document.getElementById('modal-continue-btn');

    const COUPON = {
        code: 'READY50',
        discount: 0.50, // 50%
        minSpend: 999
    };

    function renderCart() {
        const cart = getCart(); // From main.js
        
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

        cart.forEach(cartItem => {
            const product = products.find(p => p.id === cartItem.id);
            if (product) {
                subtotal += product.price;
                cartHTML += `
                    <div class="cart-item" data-id="${product.id}">
                        <a href="../pages/product-detail.html?id=${product.id}" class="cart-item-img-link">
                            <img src="${product.image}" alt="${product.name}" class="cart-item-img" onerror="this.src='https://placehold.co/100x75/1A202C/FFFFFF?text=...'">
                        </a>
                        <div class="cart-item-details">
                            <h3><a href="../pages/product-detail.html?id=${product.id}">${product.name}</a></h3>
                            <p>₹${product.price}</p>
                        </div>
                        <button class="cart-item-remove" title="Remove item"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
            }
        });

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
    
    function applyCoupon() {
        const enteredCode = promoCodeInput.value.trim().toUpperCase();
        const subtotal = getCart().reduce((acc, item) => {
            const product = products.find(p => p.id === item.id);
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
            // This path goes up one level from /cart/ and then into /pages/
            window.location.href = '../pages/login.html';
        });
    }

    function addRemoveListeners() {
        const removeButtons = document.querySelectorAll('.cart-item-remove');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.closest('.cart-item').dataset.id;
                removeFromCart(productId);
            });
        });
    }

    function removeFromCart(productId) {
        let cart = getCart();
        const updatedCart = cart.filter(item => item.id !== productId);
        localStorage.setItem('readyflow_cart', JSON.stringify(updatedCart));
        
        renderCart();
        updateCartIcon();
    }

    // Initial render of the cart on page load (only if on cart page)
    if(cartItemsContainer) {
        renderCart();
    }
});
