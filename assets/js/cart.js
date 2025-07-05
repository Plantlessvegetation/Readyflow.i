// This is a diagnostic file. It should ONLY be used for debugging.
console.log('CART.JS DIAGNOSTIC: File has started executing (very first line).');

document.addEventListener('DOMContentLoaded', () => {
    console.log('CART.JS DIAGNOSTIC: DOMContentLoaded event fired.');

    const cartItemsContainer = document.getElementById('cart-items-container');
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '<p>CART.JS DIAGNOSTIC: Cart Container accessed. If you see this, cart.js is running!</p>';
        console.log('CART.JS DIAGNOSTIC: Cart container element found and content updated.');
    } else {
        console.warn('CART.JS DIAGNOSTIC: Cart container element not found.');
    }
});

// No imports, no complex logic, just barebones execution test.