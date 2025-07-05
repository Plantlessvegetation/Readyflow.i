// This file defines the upsell plans and their details.
// Each plan's 'price' now represents its fixed cost if selected.

export const upsellPlans = [
    {
        id: 'none', // Option for no upsell
        name: 'No Upsell (Original Price)',
        price: 0, // No additional cost for this option
        description: 'Continue with your selected template at its original price.',
        detailedOfferings: []
    },
    {
        id: 'get-online',
        name: 'Get Online Bundle',
        price: 499, // Fixed price for this bundle
        description: 'Get your chosen website template customized and live on the internet, hassle-free.',
        detailedOfferings: [
            'Core Content Personalization (Name, Contact Info, Address, About Us, 3-5 Headlines)',
            'Image Replacement & Optimization (up to 5-10 images, WebP/JPG at ~70% quality)',
            'Basic SEO Files (robots.txt, sitemap.xml with main pages)'
        ]
    },
    {
        id: 'enhanced-presence',
        name: 'Enhanced Presence Pack',
        price: 999, // Fixed price for this bundle
        description: 'Increase your website\'s visibility and connect with your audience directly, building a stronger online presence.',
        detailedOfferings: [
            'All "Get Online" Bundle services are included.', // This is descriptive, not a literal price addition
            'Advanced Content Personalization (Testimonials, detailed Product/Service descriptions, FAQs)',
            'Basic On-Page SEO Elements (<title> & <meta name="description"> for 3-5 pages, H1/H2 verification)',
            'Social Media Open Graph (OG) Tags (title, description, image, url, type)',
            'WhatsApp Chat Integration (floating button with user\'s number)'
        ]
    },
    {
        id: 'pro-conversion',
        name: 'Pro Conversion Package',
        price: 2499, // Fixed price for this bundle
        description: 'Transform your website into a lead-generating asset with essential business integrations.',
        detailedOfferings: [
            'All "Enhanced Presence" Pack services are included.', // This is descriptive, not a literal price addition
            'Google Analytics Tracking Integration (user\'s GA ID)',
            'Basic Contact Form Integration (Formspree/Netlify Forms endpoint)',
            'Basic Email List Integration (user\'s embed code)'
        ]
    }
];

// Helper function to get the price of a specific upsell tier
// This now directly returns the 'price' property of the found plan.
export function getUpsellPlanPrice(selectedTierId) {
    const plan = upsellPlans.find(p => p.id === selectedTierId);
    return plan ? plan.price : 0;
}