document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('price-calculator-form');
    const priceDisplay = document.getElementById('estimated-price');

    if (!form) return; // Don't run if the form isn't on the page

    // --- AGGRESSIVE PRICING MODEL FOR NEW MARKET ENTRY ---
    const BASE_PRICES = {
        html: 2499,
        react: 5999,
    };

    const PAGE_COSTS = {
        1: 0,
        3: 2000,
        5: 3500,
        10: 7000,
    };

    const FEATURE_COSTS = {
        ecommerce: 8000,
        cms: 4000,
        animations: 2500,
    };
    // --------------------------------------------------

    function calculatePrice() {
        const formData = new FormData(form);
        const tech = formData.get('tech');
        const pages = formData.get('pages');
        const features = formData.getAll('features');

        let totalPrice = 0;
        
        // Base tech price
        totalPrice += BASE_PRICES[tech] || 0;

        // Page cost
        totalPrice += PAGE_COSTS[pages] || 0;

        // Feature costs
        features.forEach(feature => {
            totalPrice += FEATURE_COSTS[feature] || 0;
        });

        // Format the price with a Rupee symbol and commas
        priceDisplay.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
    }

    // Listen for any change on any form element
    form.addEventListener('change', calculatePrice);
    
    // Calculate the initial price when the page loads
    calculatePrice();
});
