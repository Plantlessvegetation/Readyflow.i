document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTS ---
    const sidebar = document.querySelector('.store-sidebar');
    const openBtn = document.querySelector('.open-sidebar-btn');
    const closeBtn = document.querySelector('.sidebar-close-btn');
    const productList = document.querySelector('.product-list');
    const productCountEl = document.getElementById('product-count');

    // --- SIDEBAR TOGGLING ---
    if (openBtn && sidebar) {
        openBtn.addEventListener('click', () => document.body.classList.add('sidebar-open'));
    }
    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', () => document.body.classList.remove('sidebar-open'));
    }

    // --- FILTERING & SORTING LOGIC ---
    if (productList) {
        const allProductNodes = Array.from(productList.querySelectorAll('.product-list-item'));
        const allProducts = allProductNodes.map(node => ({
            element: node,
            price: parseInt(node.dataset.price, 10),
            tech: node.dataset.tech,
            type: node.dataset.type,
            pages: parseInt(node.dataset.pages, 10)
        }));

        const filters = {
            tech: [],
            type: [],
            pages: []
        };

        const sortSelect = document.getElementById('sort-by');
        const filterCheckboxes = document.querySelectorAll('input[type="checkbox"]');

        function applyFiltersAndSort() {
            // Get current filter values
            filters.tech = Array.from(document.querySelectorAll('input[name="tech"]:checked')).map(el => el.value);
            filters.type = Array.from(document.querySelectorAll('input[name="type"]:checked')).map(el => el.value);
            filters.pages = Array.from(document.querySelectorAll('input[name="pages"]:checked')).map(el => parseInt(el.value, 10));

            let filteredProducts = [...allProducts];

            // Apply tech filter
            if (filters.tech.length > 0) {
                filteredProducts = filteredProducts.filter(p => filters.tech.includes(p.tech));
            }
            // Apply type filter
            if (filters.type.length > 0) {
                filteredProducts = filteredProducts.filter(p => filters.type.includes(p.type));
            }
            // Apply pages filter
            if (filters.pages.length > 0) {
                filteredProducts = filteredProducts.filter(p => filters.pages.includes(p.pages));
            }
            
            // Apply sorting
            const sortBy = sortSelect.value;
            if (sortBy === 'price-asc') {
                filteredProducts.sort((a, b) => a.price - b.price);
            } else if (sortBy === 'price-desc') {
                filteredProducts.sort((a, b) => b.price - a.price);
            }
            
            renderProducts(filteredProducts);
        }

        function renderProducts(products) {
            productList.innerHTML = ''; // Clear current list
            products.forEach(p => productList.appendChild(p.element));
            productCountEl.textContent = products.length;
        }
        
        // Add event listeners
        sortSelect.addEventListener('change', applyFiltersAndSort);
        filterCheckboxes.forEach(box => box.addEventListener('change', applyFiltersAndSort));
        
        // Initial render
        applyFiltersAndSort();
    }
});