// This script handles all functionality for the template store and product detail pages.

import { products } from './products.js';
import { getCart, updateCartIcon } from './main.js';
import { auth, db, currentUser } from './login.js'; // Import auth, db, currentUser
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js"; // Import Firestore functions

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
                const videoId = initialMedia.src.split('v=')[1]?.split('&')[0] || initialMedia.src.split('/').pop();
                mainMediaHTML = `<iframe class="showcased-video" src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            } else if (initialMedia.type === 'video') {
                 mainMediaHTML = `<video class="showcased-video" controls autoplay loop muted playsinline><source src="${initialMedia.src}" type="video/mp4"></video>`;
            } else {
                mainMediaHTML = `<img src="${initialMedia.src}" alt="${product.name}" class="showcased-image">`;
            }

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
            initializeProductGallery();
            initializeAddToCart();
        } else {
            productDetailContainer.innerHTML = '<p>Product not found. Please return to the <a href="website-store.html">store</a>.</p>';
        }
    }

    // --- CART & GALLERY FUNCTIONS ---
    function initializeAddToCart() {
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', async (e) => { // Made async
                const productId = e.target.dataset.id;
                await addToCart(productId); // Await the async addToCart
            });
        }
    }

    async function addToCart(productId) { // Made async
        let cart = await getCart(); // Await getCart()
        const productToAdd = products.find(p => p.id === productId);

        if (!productToAdd) {
            console.error('Product not found:', productId);
            showToastNotification('Error: Product not found.');
            return;
        }

        // Check if item is already in cart
        if (cart.find(item => item.id === productId)) {
            showToastNotification('This item is already in your cart.');
            return;
        }

        cart.push({ id: productId, quantity: 1 });

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
        showToastNotification(`${productToAdd.name} has been added to your cart!`);
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