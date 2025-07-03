// This script handles all functionality for the template store and product detail pages.

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Phase 2: Dynamic Product Listing ---
    const productContainer = document.getElementById('product-container');
    if (productContainer) {
        // This code runs ONLY on the website-store.html page
        if (typeof products !== 'undefined' && products.length > 0) {
            let productsHTML = '';
            products.forEach(product => {
                productsHTML += `
                    <div class="product-item" data-price="${product.price}" data-tech="${product.tags.join(' ')}" data-type="${product.type}" data-pages="${product.pages}">
                        <div class="item-image"><img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/400x300/1A202C/FFFFFF?text=Image+Not+Found'"></div>
                        <div class="item-details">
                            <h3 class="item-title">${product.name}</h3>
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
        } else {
            productContainer.innerHTML = '<p>No products found.</p>';
        }
    }

    // --- Phase 3: Dynamic Product Detail Page ---
    const productDetailContainer = document.getElementById('product-detail-container');
    if (productDetailContainer) {
        // This code runs ONLY on the product-detail.html page
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const product = products.find(p => p.id === productId);

        if (product) {
            // Update the page title
            document.title = `${product.name} - ReadyFlow`;

            // Generate the HTML for the product details
            const detailHTML = `
                <div class="product-media">
                    <div class="main-media-display">
                        <video class="showcased-video" controls autoplay loop muted playsinline style="display: ${product.media[0].type === 'video' ? 'block' : 'none'};">
                            <source src="${product.media[0].src}" type="video/mp4">
                        </video>
                        <img src="${product.media[0].type === 'image' ? product.media[0].src : ''}" alt="${product.name}" class="showcased-image" style="display: ${product.media[0].type === 'image' ? 'block' : 'none'};">
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
                    <ul class="use-case-list">
                        ${product.useCases.map(useCase => `<li>${useCase}</li>`).join('')}
                    </ul>
                    <div class="product-page-purchase">
                        <span class="product-page-price">₹${product.price}</span>
                        <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                    </div>
                </div>
            `;
            productDetailContainer.innerHTML = detailHTML;
            
            // Re-run the gallery logic now that the elements exist
            initializeProductGallery();

        } else {
            productDetailContainer.innerHTML = '<p>Product not found. Please return to the <a href="website-store.html">store</a>.</p>';
        }
    }

    // --- SHARED FUNCTIONS ---

    function initializeProductGallery() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        const mainImage = document.querySelector('.showcased-image');
        const mainVideo = document.querySelector('.showcased-video');

        if (thumbnails.length > 0 && (mainImage || mainVideo)) {
            thumbnails.forEach(thumb => {
                thumb.addEventListener('click', () => {
                    document.querySelector('.thumbnail.active').classList.remove('active');
                    thumb.classList.add('active');
                    const type = thumb.dataset.type;
                    const src = thumb.dataset.src;
                    if (type === 'video') {
                        if(mainVideo) mainVideo.style.display = 'block';
                        if(mainImage) mainImage.style.display = 'none';
                        if(mainVideo) mainVideo.src = src;
                    } else {
                        if(mainVideo) mainVideo.style.display = 'none';
                        if(mainImage) mainImage.style.display = 'block';
                        if(mainImage) mainImage.src = src;
                    }
                });
            });
        }
    }

    // --- ELEMENTS (for existing functionality) ---
    const sidebar = document.querySelector('.store-sidebar');
    const openBtn = document.querySelector('.open-sidebar-btn');
    const closeBtn = document.querySelector('.sidebar-close-btn');
    const listViewBtn = document.getElementById('list-view-btn');
    const gridViewBtn = document.getElementById('grid-view-btn');
    const pageOverlay = document.querySelector('.page-overlay');

    // --- SIDEBAR TOGGLING ---
    if (openBtn && sidebar) openBtn.addEventListener('click', () => document.body.classList.add('sidebar-open'));
    if (closeBtn && sidebar) closeBtn.addEventListener('click', () => document.body.classList.remove('sidebar-open'));
    if (pageOverlay) pageOverlay.addEventListener('click', () => document.body.classList.remove('sidebar-open'));

    // --- VIEW SWITCHER LOGIC ---
    if (productContainer && listViewBtn && gridViewBtn) {
        const setView = (view) => {
            localStorage.setItem('store_view', view);
            if (view === 'grid') {
                productContainer.classList.remove('product-list');
                productContainer.classList.add('product-grid');
                gridViewBtn.classList.add('active');
                listViewBtn.classList.remove('active');
            } else {
                productContainer.classList.remove('product-grid');
                productContainer.classList.add('product-list');
                listViewBtn.classList.add('active');
                gridViewBtn.classList.remove('active');
            }
        };
        listViewBtn.addEventListener('click', () => setView('list'));
        gridViewBtn.addEventListener('click', () => setView('grid'));
        const savedView = localStorage.getItem('store_view') || 'list';
        setView(savedView);
    }
});
