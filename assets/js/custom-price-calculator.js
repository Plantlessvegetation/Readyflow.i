document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTS ---
    const techOptions = document.querySelectorAll('[data-group="tech"] .option-box');
    const typeOptions = document.querySelectorAll('[data-group="type"] .option-box');
    const integrationOptions = document.querySelectorAll('[data-group="integrations"] .option-box');
    const pageSlider = document.getElementById('page-slider');
    const pageCountDisplay = document.getElementById('page-count-display');
    const priceDisplay = document.getElementById('estimated-price');
    const priceBarFill = document.getElementById('price-bar-fill');
    const pagesSection = document.getElementById('pages-section'); // Get the section itself

    if (!pageSlider) return; // Exit if not on the calculator page

    // --- PRICING CONFIG (Aggressive Indian Market Pricing) ---
    const PRICING = {
        tech: { html: 1999, react: 4999 },
        type: { 'landing-page': 500, 'full-website': 2000 },
        perPage: 999,
        integrations: { seo: 1499, ecommerce: 7999, cms: 3999 }
    };

    const MAX_ESTIMATE = 50000;

    // --- STATE ---
    let selections = {
        tech: 'html',
        type: 'landing-page',
        pages: 1,
        integrations: []
    };

    // --- FUNCTIONS ---
    function calculatePrice() {
        let total = 0;
        total += PRICING.tech[selections.tech] || 0;
        total += PRICING.type[selections.type] || 0;
        
        // Only add page cost if it's a full website
        if (selections.type === 'full-website') {
            total += (selections.pages - 1) * PRICING.perPage;
        }

        selections.integrations.forEach(int => {
            total += PRICING.integrations[int] || 0;
        });

        priceDisplay.textContent = `₹${total.toLocaleString('en-IN')}`;
        const barWidth = Math.min(100, (total / MAX_ESTIMATE) * 100);
        priceBarFill.style.width = `${barWidth}%`;
    }

    function handleOptionClick(options, key, isMultiSelect = false) {
        options.forEach(box => {
            box.addEventListener('click', () => {
                const value = box.dataset.value;
                if (isMultiSelect) {
                    box.classList.toggle('selected');
                    if (selections[key].includes(value)) {
                        selections[key] = selections[key].filter(item => item !== value);
                    } else {
                        selections[key].push(value);
                    }
                } else {
                    options.forEach(opt => opt.classList.remove('selected'));
                    box.classList.add('selected');
                    selections[key] = value;
                }

                // ** NEW LOGIC TO SHOW/HIDE PAGES SECTION **
                if (key === 'type') {
                    if (value === 'full-website') {
                        pagesSection.style.display = 'block';
                        // Use the slider's current value when showing it
                        selections.pages = parseInt(pageSlider.value, 10);
                    } else {
                        pagesSection.style.display = 'none';
                        // CRITICAL: Reset pages to 1 for landing page
                        selections.pages = 1;
                    }
                }
                
                calculatePrice();
            });
        });
    }

    // --- EVENT LISTENERS ---
    handleOptionClick(techOptions, 'tech');
    handleOptionClick(typeOptions, 'type');
    handleOptionClick(integrationOptions, 'integrations', true);

    pageSlider.addEventListener('input', (e) => {
        selections.pages = parseInt(e.target.value, 10);
        pageCountDisplay.textContent = selections.pages;
        calculatePrice();
    });

    // --- INITIAL CALCULATION ---
    calculatePrice();
});
