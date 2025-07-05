// This script handles all functionality for the template store and product detail pages.

import { products } from './products.js';
import { getCart, updateCartIcon } from './main.js';
import { auth, db, currentUser } from './login.js'; // Import auth, db, currentUser
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js"; // Import Firestore functions
import { upsellPlans, getUpsellPlanPrice } from './upsells.js'; // NEW: Import upsell data and helper

document.addEventListener('DOMContentLoaded', () => {
    // NEW: Declaring these variables AND functions in a higher scope (DOMContentLoaded)
    let selectedUpsellId = 'none'; // Default to no upsell selected
    let baseProductOriginalPrice = 0; // Store the original product price
    let currentPriceDisplayEl; // Will be set during render

    // Function to calculate and update total price based on correct upsell logic
    // MOVED: This function is now in the higher DOMContentLoaded scope
    function updateTotalPrice() {
        console.log('updateTotalPrice called.'); // Debug log
        console.log('selectedUpsellId:', selectedUpsellId); // Debug log
        console.log('baseProductOriginalPrice:', baseProductOriginalPrice); // Debug log

        let total = baseProductOriginalPrice; // Start with original price
        
        if (selectedUpsellId !== 'none') {
            const upsellFixedPrice = getUpsellPlanPrice(selectedUpsellId);
            total = (baseProductOriginalPrice / 2) + upsellFixedPrice; // Halve template price + upsell fixed price
        }

        console.log('Calculated total:', total); // Debug log

        if (currentPriceDisplayEl) {
            console.log('currentPriceDisplayEl found. Old text:', currentPriceDisplayEl.textContent); // Debug log
            currentPriceDisplayEl.textContent = `₹${total.toLocaleString('en-IN')}`;
            console.log('currentPriceDisplayEl new text:', currentPriceDisplayEl.textContent); // Debug log
        } else {
            console.warn('currentPriceDisplayEl not found!'); // Debug warning
        }
    }


    // --- Store Page Logic ---
    const storePageContainer = document.getElementById('product-container');
    if (storePageContainer) {
        const productContainer = storePageContainer;
        const openBtn = document.querySelector('.open-sidebar-btn');
        const closeBtn = document.querySelector('.sidebar-sidebar-close-btn');
        const pageOverlay = document.querySelector('.page-overlay');
        const listViewBtn = document.getElementById('list-view-btn');
        const gridViewBtn = document.getElementById('grid-view-btn');
        const sortSelects = document.querySelectorAll('#sort-by, #sort-by-mobile');
        const filterCheckboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');

        // --- RENDER PRODUCTS ---
        function renderProducts(productsToRender) {
            productContainer.innerHTML = ''; // Clear existing products
            if (productsToRender.length === 0) {
                productContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1 / -1;">No products match your criteria.</p>';
                return;
            }
            let productsHTML = '';
            productsToRender.forEach(product => {
                productsHTML += `
                    <div class="product-item">
                        <div class="item-image"><a href="product-detail.html?id=${product.id}"><img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/400x300/1A202C/FFFFFF?text=Image+Not+Found'"></a></div>
                        <div class="item-details">
                            <h3 class="item-title"><a href="product-detail.html?id=${product.id}">${product.name}</a></h3>
                            <div class="item-tags">${product.tags.map(tag => `<span class="tag ${tag}-tag">${tag.toUpperCase()}</span>`).join('')}</div>
                            <p class="item-description">${product.description}</p>
                        </div>
                        <div class="item-action">
                            <span class="item-price">₹${product.price}</span>
                            <a href="product-detail.html?id=${product.id}" class="btn btn-secondary">View Details</a>
                        </div>
                    </div>
                `;
            });
            productContainer.innerHTML = productsHTML;
        }

        // --- FILTER & SORT LOGIC ---
        function applyFiltersAndSort() {
            let filteredProducts = [...products]; // Start with all products

            const activeFilters = {
                tech: [],
                type: [],
                pages: []
            };
            filterCheckboxes.forEach(cb => {
                if (cb.checked) {
                    activeFilters[cb.name].push(cb.value);
                }
            });

            if (activeFilters.tech.length > 0) {
                filteredProducts = filteredProducts.filter(p => p.tags.some(tag => activeFilters.tech.includes(tag)));
            }
            if (activeFilters.type.length > 0) {
                filteredProducts = filteredProducts.filter(p => activeFilters.type.includes(p.type));
            }
            if (activeFilters.pages.length > 0) {
                filteredProducts = filteredProducts.filter(p => activeFilters.pages.includes(p.pages));
            }

            const sortBy = sortSelects[0].value;
            if (sortBy === 'price-asc') {
                filteredProducts.sort((a, b) => a.price - b.price);
            } else if (sortBy === 'price-desc') {
                filteredProducts.sort((a, b) => b.price - a.price);
            }

            renderProducts(filteredProducts);
        }

        // --- VIEW SWITCHER ---
        function setView(view) {
            localStorage.setItem('store_view', view);
            if (view === 'grid') {
                productContainer.classList.remove('product-list');
                productContainer.classList.add('product-grid');
                if(gridViewBtn) gridViewBtn.classList.add('active');
                if(listViewBtn) listViewBtn.classList.remove('active');
            } else {
                productContainer.classList.remove('product-grid');
                productContainer.classList.add('product-list');
                if(listViewBtn) listViewBtn.classList.add('active');
                if(gridViewBtn) gridViewBtn.classList.remove('active');
            }
        }

        // --- EVENT LISTENERS ---
        if (openBtn) openBtn.addEventListener('click', () => document.body.classList.add('sidebar-open'));
        if (closeBtn) closeBtn.addEventListener('click', () => document.body.classList.remove('sidebar-open'));
        if (pageOverlay) pageOverlay.addEventListener('click', () => document.body.classList.remove('sidebar-open'));

        if (listViewBtn) listViewBtn.addEventListener('click', () => setView('list'));
        if (gridViewBtn) gridViewBtn.addEventListener('click', () => setView('grid'));

        sortSelects.forEach(select => select.addEventListener('change', (e) => {
            // Sync both dropdowns
            sortSelects.forEach(s => s.value = e.target.value);
            applyFiltersAndSort();
        }));
        filterCheckboxes.forEach(cb => cb.addEventListener('change', applyFiltersAndSort));

        // --- INITIAL RENDER ---
        const savedView = localStorage.getItem('store_view') || 'list';
        setView(savedView);
        applyFiltersAndSort();
    }


    // --- Product Detail Page Logic ---
    const productDetailContainer = document.getElementById('product-detail-container');
    if (productDetailContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const product = products.find(p => p.id === productId);

        if (product) {
            document.title = `${product.name} - ReadyFlow`;
            baseProductOriginalPrice = product.price; // Set initial original product price

            const initialMedia = product.media[0];
            let mainMediaHTML = '';
            if (initialMedia.type === 'youtube') {
                const videoId = initialMedia.src.split('v=')[1]?.split('&')[0] || initialMedia.src.split('/').pop();
                mainMediaHTML = `<iframe class="showcased-video" src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            } else if (initialMedia.type === 'video') {
                 mainMediaHTML = `<video class="showcased-video" controls autoplay loop muted playsinline><source src="${initialMedia.src}" type="video/mp4"></video>`;
            } else {
                mainMediaHTML = `<img src="${initialMedia.src}" alt="${product.name}" class="showcased-image">`;
            }

            // NEW: Generate upsell options HTML dynamically
            const upsellOptionsHTML = upsellPlans.map(plan => `
                <label class="upsell-option ${plan.id === 'none' ? 'selected' : ''}">
                    <input type="radio" name="upsell-plan" value="${plan.id}" ${plan.id === 'none' ? 'checked' : ''}>
                    <div class="upsell-info-content">
                        <h4>${plan.name}</h4>
                        <p>${plan.description}</p>
                        ${plan.id !== 'none' ? `<span class="upsell-price-label">+ ₹${plan.price.toLocaleString('en-IN')}</span>` : ''}
                    </div>
                    ${plan.detailedOfferings.length > 0 ? `<button type="button" class="upsell-info-button" data-upsell-id="${plan.id}"><i class="fas fa-info-circle"></i></button>` : ''}
                </label>
            `).join('');


            const detailHTML = `
                <div class="product-media">
                    <div class="main-media-display" id="main-media-display">
                        ${mainMediaHTML}
                    </div>
                    <div class="thumbnail-gallery">
                        ${product.media.map((item, index) => `
                            <img src="${item.thumb}" alt="Thumbnail ${index + 1}" class="thumbnail ${index === 0 ? 'active' : ''}" data-type="${item.type}" data-src="${item.src}">
                        `).join('')}
                    </div>
                </div>
                <div class="product-details">
                    <div class="tech-tags">${product.tags.map(tag => `<span class="tag ${tag}-tag">${tag.toUpperCase()}</span>`).join('')}</div>
                    <h1 class="product-page-title">${product.name}</h1>
                    <p class="product-page-description">${product.description}</p>
                    <h3>Best For:</h3>
                    <ul class="use-case-list">${product.useCases.map(useCase => `<li>${useCase}</li>`).join('')}</ul>

                    <div class="upsell-section">
                        <button class="upsell-accordion-header">
                            Add Powerful Features & Save 50% on Template Price!
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="upsell-content">
                            <div class="upsell-options-container">
                                ${upsellOptionsHTML}
                            </div>
                        </div>
                    </div>

                    <div class="product-page-purchase">
                        <div class="product-page-price">₹${product.price}</div>
                        <div class="button-group">
                            <button class="btn btn-secondary add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                            <button class="btn btn-primary buy-now-btn" data-id="${product.id}">Buy Now</button>
                        </div>
                    </div>
                    <div class="offers-section">
                        <h4><i class="fas fa-tags"></i> Special Offers</h4>
                        <p>Sign up to get 50% off on orders above ₹999!</p>
                        <div class="coupon-code">Use Code: <strong>READY50</strong></div>
                    </div>
                </div>
            `;
            productDetailContainer.innerHTML = detailHTML;

            currentPriceDisplayEl = productDetailContainer.querySelector('.product-page-price'); // Set element reference
            updateTotalPrice(); // Initial price display

            initializeProductGallery();
            initializeAddToCart();
            initializeUpsellLogic(); // NEW: Initialize upsell specific JS

        } else {
            productDetailContainer.innerHTML = '<p>Product not found. Please return to the <a href="website-store.html">store</a>.</p>';
        }
    }

    // --- NEW: UPSALE LOGIC INITIALIZATION ---
    function initializeUpsellLogic() {
        const upsellAccordionHeader = document.querySelector('.upsell-accordion-header');
        const upsellContent = document.querySelector('.upsell-content');
        const upsellRadioButtons = document.querySelectorAll('input[name="upsell-plan"]');
        const upsellInfoButtons = document.querySelectorAll('.upsell-info-button');
        const upsellInfoModal = document.getElementById('upsell-info-modal');
        const upsellInfoCloseBtn = document.getElementById('upsell-info-close-btn');
        const upsellInfoModalTitle = document.getElementById('upsell-info-modal-title');
        const upsellInfoModalDesc = document.getElementById('upsell-info-modal-description');
        const upsellInfoModalOfferings = document.getElementById('upsell-info-modal-offerings');


        // Accordion toggle
        if (upsellAccordionHeader) {
            upsellAccordionHeader.addEventListener('click', () => {
                upsellContent.classList.toggle('active');
                upsellAccordionHeader.classList.toggle('active');
                // Animate content height
                if (upsellContent.classList.contains('active')) {
                    upsellContent.style.maxHeight = upsellContent.scrollHeight + 'px';
                } else {
                    upsellContent.style.maxHeight = null;
                }
            });
        }

        // Radio button change listener
        upsellRadioButtons.forEach(radio => {
            radio.addEventListener('change', (event) => {
                selectedUpsellId = event.target.value;
                // Update selection visual for labels
                upsellRadioButtons.forEach(rb => rb.closest('.upsell-option').classList.remove('selected'));
                event.target.closest('.upsell-option').classList.add('selected');
                updateTotalPrice(); // NEW: Call updateTotalPrice on upsell selection
            });
        });

        // Info button click listener
        upsellInfoButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const upsellId = event.currentTarget.dataset.upsellId;
                const plan = upsellPlans.find(p => p.id === upsellId);

                if (plan) {
                    upsellInfoModalTitle.textContent = plan.name;
                    upsellInfoModalDesc.textContent = plan.description;
                    upsellInfoModalOfferings.innerHTML = plan.detailedOfferings.map(item => `<li>${item}</li>`).join('');
                    upsellInfoModal.classList.add('show');
                }
            });
        });

        // Close info modal
        if (upsellInfoCloseBtn) {
            upsellInfoCloseBtn.addEventListener('click', () => {
                upsellInfoModal.classList.remove('show');
            });
        }
    }


    // --- CART & GALLERY FUNCTIONS ---
    function initializeAddToCart() {
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', async (e) => { // Made async
                const productId = e.target.dataset.id;
                // NEW: Pass selectedUpsellId to addToCart
                await addToCart(productId, selectedUpsellId); // Await the async addToCart
            });
        }
    }

    async function addToCart(productId, selectedUpsellId = 'none') { // Modified to accept upsellId
        let cart = await getCart(); // Await getCart()
        const productToAdd = products.find(p => p.id === productId);

        if (!productToAdd) {
            console.error('Product not found:', productId);
            showToastNotification('Error: Product not found.');
            return;
        }

        // Check if item (product + specific upsell) is already in cart
        // A product with "no upsell" is different from a product with "get-online" upsell
        if (cart.find(item => item.id === productId && item.upsellId === selectedUpsellId)) {
            showToastNotification('This specific item configuration is already in your cart.');
            return;
        }

        // Push product with selected upsell ID
        cart.push({ id: productId, quantity: 1, upsellId: selectedUpsellId });

        if (auth.currentUser) { // Use auth.currentUser directly
            // User is logged in, save to Firestore
            const cartRef = doc(db, 'carts', auth.currentUser.uid);
            try {
                await setDoc(cartRef, { items: cart }); // Overwrite with updated cart
                console.log('Cart updated in Firestore.');
            } catch (error) {
                console.error('Error updating cart in Firestore:', error);
                showToastNotification('Error updating cart.');
                return;
            }
        } else {
            // User is not logged in, save to localStorage
            localStorage.setItem('readyflow_cart', JSON.stringify(cart));
            console.log('Cart updated in localStorage.');
        }

        await updateCartIcon(); // Await updateCartIcon()
        
        // Find the upsell name for the toast notification
        const upsellNameForToast = (selectedUpsellId && selectedUpsellId !== 'none') 
                                   ? ` with ${upsellPlans.find(p => p.id === selectedUpsellId)?.name}` 
                                   : '';
        showToastNotification(`${productToAdd.name}${upsellNameForToast} has been added to your cart!`);
    }

    function showToastNotification(message) {
        let toast = document.querySelector('.toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast-notification';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    function initializeProductGallery() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        const mainMediaContainer = document.getElementById('main-media-display');

        if (thumbnails.length > 0 && mainMediaContainer) {
            thumbnails.forEach(thumb => {
                thumb.addEventListener('click', () => {
                    document.querySelector('.thumbnail.active').classList.remove('active');
                    thumb.classList.add('active');
                    const type = thumb.dataset.type;
                    const src = thumb.dataset.src;

                    let newMediaHTML = '';
                    if (type === 'youtube') {
                        const videoId = src.split('v=')[1]?.split('&')[0] || src.split('/').pop();
                        newMediaHTML = `<iframe class="showcased-video" src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                    } else if (type === 'video') {
                        newMediaHTML = `<video class="showcased-video" controls autoplay loop muted playsinline><source src="${src}" type="video/mp4"></video>`;
                    } else {
                        newMediaHTML = `<img src="${src}" alt="Product image" class="showcased-image">`;
                    }
                    mainMediaContainer.innerHTML = newMediaHTML;
                });
            });
        }
    }
});