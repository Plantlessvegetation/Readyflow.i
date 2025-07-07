// This script handles all functionality for the template store and product detail pages.

import { products } from './products.js';
import { getCart, updateCartIcon } from './main.js';
import { auth, db, currentUser } from './login.js'; // Import auth, db, currentUser
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js"; // Import Firestore functions
import { upsellPlans, getUpsellPlanPrice, getUpsellPlanDetails } from './upsell.js'; // Import upsell logic

document.addEventListener('DOMContentLoaded', () => {

    // --- Store Page Logic ---
    const storePageContainer = document.getElementById('product-container');
    if (storePageContainer) {
        const productContainer = storePageContainer;
        const openBtn = document.querySelector('.open-sidebar-btn');
        const closeBtn = document.querySelector('.sidebar-close-btn');
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

            const initialMedia = product.media[0];
            let mainMediaHTML = '';
            if (initialMedia.type === 'youtube') {
                // Corrected YouTube embed URL format
                const videoId = initialMedia.src.split('v=')[1]?.split('&')[0] || initialMedia.src.split('/').pop();
                mainMediaHTML = `<iframe class="showcased-video" src="http://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            } else if (initialMedia.type === 'video') {
                 mainMediaHTML = `<video class="showcased-video" controls autoplay loop muted playsinline><source src="${initialMedia.src}" type="video/mp4"></video>`;
            } else {
                mainMediaHTML = `<img src="${initialMedia.src}" alt="${product.name}" class="showcased-image">`;
            }

            // Generate upsell accordion HTML with updated structure for pricing and info icon
            let upsellAccordionHTML = '';
            upsellPlans.forEach((plan, index) => {
                upsellAccordionHTML += `
                    <div class="radio-option">
                        <input type="radio" id="upsell-${plan.id}" name="upsell" value="${plan.id}" ${plan.id === 'none' ? 'checked' : ''}>
                        <label for="upsell-${plan.id}">
                            <span class="radio-circle"></span>
                            <div class="option-header-content">
                                <span class="option-name">${plan.name}</span>
                                ${plan.id !== 'none' ? `<button class="info-icon" data-upsell-id="${plan.id}" title="More info"><i class="fas fa-info-circle"></i></button>` : ''}
                            </div>
                            <p class="option-description">${plan.description}</p>
                            <span class="option-price">${plan.id === 'none' ? `₹${product.price}` : `+ ₹${plan.price}`}</span>
                        </label>
                    </div>
                `;
            });

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
                    
                    <div class="product-page-purchase">
                        <div class="product-page-price">₹<span id="display-product-price">${product.price}</span></div>
                        
                        <div class="upsell-accordion">
                            <div class="accordion-header" id="upsell-accordion-header">
                                <h4>Add Powerful Features & Get Template for FREE!</h4>
                                <i class="fas fa-chevron-down accordion-icon"></i>
                            </div>
                            <div class="accordion-content">
                                <p class="accordion-intro">Select a Service Bundle (Template FREE with Bundle!):</p>
                                ${upsellAccordionHTML}
                            </div>
                        </div>

                        <div class="button-group">
                            <button class="btn btn-secondary add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                            <button class="btn btn-primary buy-now-btn" data-id="${product.id}">Buy Now</button>
                        </div>
                    </div>
                    <div class="offers-section">
                        <h4><i class="fas fa-tags"></i> Special Offers</h4>
                        <p>Sign up to get 50% off at checkout on orders above ₹999!</p>
                        <div class="coupon-code">Use Code: <strong>READY50</strong></div>
                    </div>
                </div>
            `;
            productDetailContainer.innerHTML = detailHTML;
            initializeProductGallery();
            initializeAddToCart();
            initializeUpsellAccordion(product.price); // Initialize accordion and upsell selection
            initializeUpsellInfoModal(); // Initialize the new modal functionality
        } else {
            productDetailContainer.innerHTML = '<p>Product not found. Please return to the <a href="website-store.html">store</a>.</p>';
        }
    }

    // --- CART & GALLERY FUNCTIONS ---
    function initializeAddToCart() {
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', async (e) => {
                const productId = e.target.dataset.id;
                const selectedUpsellId = document.querySelector('input[name="upsell"]:checked')?.value || 'none';
                await addToCart(productId, selectedUpsellId);
            });
        }
        // TODO: Implement buy now button functionality if needed, potentially leading directly to checkout.
    }

    async function addToCart(productId, upsellId = 'none') {
        let cart = await getCart();
        const productToAdd = products.find(p => p.id === productId);
        const selectedUpsellPlan = getUpsellPlanDetails(upsellId);

        if (!productToAdd) {
            console.error('Product not found:', productId);
            showToastNotification('Error: Product not found.');
            return;
        }

        // Check if this specific product-upsell combination is already in cart
        if (cart.find(item => item.id === productId && item.upsellId === upsellId)) {
            showToastNotification(`This item with the selected bundle is already in your cart.`);
            return;
        }

        // Add item to cart with upsellId and original product price
        // Note: originalProductPrice is stored to retrieve base price if upsell is removed or for other calculations
        cart.push({ id: productId, quantity: 1, upsellId: upsellId, originalProductPrice: productToAdd.price });

        if (auth.currentUser) {
            const cartRef = doc(db, 'carts', auth.currentUser.uid);
            try {
                await setDoc(cartRef, { items: cart });
                console.log('Cart updated in Firestore.');
            } catch (error) {
                console.error('Error updating cart in Firestore:', error);
                showToastNotification('Error updating cart.');
                return;
            }
        } else {
            localStorage.setItem('readyflow_cart', JSON.stringify(cart));
            console.log('Cart updated in localStorage.');
        }

        await updateCartIcon();
        let message = `${productToAdd.name} has been added to your cart!`;
        if (selectedUpsellPlan && selectedUpsellPlan.id !== 'none') {
            message = `${productToAdd.name} with "${selectedUpsellPlan.name}" has been added to your cart!`;
        }
        showToastNotification(message);
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
                        // Corrected YouTube embed URL format
                        const videoId = src.split('v=')[1]?.split('&')[0] || src.split('/').pop();
                        newMediaHTML = `<iframe class="showcased-video" src="http://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
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

    // --- Accordion and Upsell Selection Logic ---
    function initializeUpsellAccordion(originalProductPrice) {
        const accordionHeader = document.getElementById('upsell-accordion-header');
        const accordionContent = document.querySelector('.upsell-accordion .accordion-content');
        const accordionIcon = accordionHeader.querySelector('.accordion-icon');
        const radioOptions = document.querySelectorAll('input[name="upsell"]');
        const displayProductPriceEl = document.getElementById('display-product-price');

        // Initial state: collapsed
        accordionContent.style.maxHeight = null;
        accordionIcon.classList.remove('fa-chevron-up');
        accordionIcon.classList.add('fa-chevron-down');

        // Toggle accordion on header click
        accordionHeader.addEventListener('click', () => {
            if (accordionContent.style.maxHeight) {
                accordionContent.style.maxHeight = null;
                accordionIcon.classList.remove('fa-chevron-up');
                accordionIcon.classList.add('fa-chevron-down');
            } else {
                accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
                accordionIcon.classList.remove('fa-chevron-down');
                accordionIcon.classList.add('fa-chevron-up');
            }
        });

        // Handle radio button changes for price update
        radioOptions.forEach(radio => {
            radio.addEventListener('change', () => {
                const selectedUpsellId = radio.value;
                let currentDisplayPrice = originalProductPrice;

                if (selectedUpsellId !== 'none') {
                    currentDisplayPrice = getUpsellPlanPrice(selectedUpsellId);
                }
                
                if (displayProductPriceEl) {
                    displayProductPriceEl.textContent = currentDisplayPrice.toLocaleString('en-IN');
                }
            });
        });

        // Ensure initial price display based on default selected radio button (which is 'none')
        const initiallyCheckedRadio = document.querySelector('input[name="upsell"]:checked');
        if (initiallyCheckedRadio) {
            initiallyCheckedRadio.dispatchEvent(new Event('change')); // Trigger change to set initial price
        }
    }


    // --- Upsell Info Modal Logic ---
    function initializeUpsellInfoModal() {
        const modalOverlay = document.getElementById('upsell-info-modal-overlay');
        const modalCloseBtn = document.getElementById('upsell-modal-close-btn');
        const modalTitle = document.getElementById('upsell-modal-title');
        const modalDescription = document.getElementById('upsell-modal-description');
        const modalOfferingsList = document.getElementById('upsell-modal-offerings-list');
        const infoButtons = document.querySelectorAll('.info-icon');

        infoButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the parent label/radio option's click event from firing
                const upsellId = e.currentTarget.dataset.upsellId;
                const planDetails = getUpsellPlanDetails(upsellId);

                if (planDetails) {
                    modalTitle.textContent = planDetails.name;
                    modalDescription.textContent = planDetails.description;
                    modalOfferingsList.innerHTML = planDetails.detailedOfferings.map(offering => `<li><i class="fas fa-check-circle"></i> ${offering}</li>`).join('');
                    modalOverlay.classList.add('show');
                }
            });
        });

        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => {
                modalOverlay.classList.remove('show');
            });
        }

        // Close modal if clicking outside content
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    modalOverlay.classList.remove('show');
                }
            });
        }
    }

});