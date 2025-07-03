document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTS ---
    const sidebar = document.querySelector('.store-sidebar');
    const openBtn = document.querySelector('.open-sidebar-btn');
    const closeBtn = document.querySelector('.sidebar-close-btn');
    const productContainer = document.getElementById('product-container');
    const productCountEl = document.getElementById('product-count');
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

    // --- FILTERING & SORTING LOGIC ---
    if (productContainer) {
        // (Your existing filtering logic goes here...)
    }

    // --- SINGLE PRODUCT PAGE GALLERY LOGIC ---
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.querySelector('.showcased-image');
    const mainVideo = document.querySelector('.showcased-video');

    if (thumbnails.length > 0 && mainImage && mainVideo) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                document.querySelector('.thumbnail.active').classList.remove('active');
                thumb.classList.add('active');
                const type = thumb.dataset.type;
                if (type === 'video') {
                    mainVideo.style.display = 'block';
                    mainImage.style.display = 'none';
                } else {
                    mainVideo.style.display = 'none';
                    mainImage.style.display = 'block';
                    mainImage.src = thumb.dataset.src;
                }
            });
        });
    }
});
