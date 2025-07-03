// This file acts as our central database for all website products.
// To add a new product, simply copy one of the objects and change the details.

const products = [
  {
    id: 'cafe-business',
    name: 'Cafe & Small Business',
    price: 349, // Updated price
    tags: ['html'],
    type: 'website',
    pages: '2-5',
    image: '../assets/images/cafe-small-business.png',
    description: 'A charming template perfect for local cafes, bakeries, and small shops.',
    useCases: ['Local Cafes', 'Bakeries & Sweet Shops', 'Small Boutiques', 'Artisan Stores'],
    media: [
      { type: 'video', src: '../assets/images/cafe-video.mp4', thumb: '../assets/images/cafe-video-thumb.png' },
      { type: 'image', src: '../assets/images/cafe-home.png', thumb: '../assets/images/cafe-home.png' },
      { type: 'image', src: '../assets/images/cafe-menu.png', thumb: '../assets/images/cafe-menu.png' },
      { type: 'image', src: '../assets/images/cafe-hours.png', thumb: '../assets/images/cafe-hours.png' },
      { type: 'image', src: '../assets/images/cafe-reviews.png', thumb: '../assets/images/cafe-reviews.png' },
    ]
  },
  {
    id: 'event-webinar',
    name: 'Event & Webinar',
    price: 299, // Updated price
    tags: ['html'],
    type: 'landing-page',
    pages: '1',
    image: '../assets/images/event-webinar.png',
    description: 'A high-converting landing page to drive registrations for your next event.',
    useCases: ['Webinar Registrations', 'Conference Sign-ups', 'Workshop Tickets', 'Product Launches'],
    media: [
        { type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', thumb: 'https://placehold.co/150x100/1A202C/FFFFFF?text=Video' },
        { type: 'image', src: 'https://placehold.co/1280x720/1A202C/FFFFFF?text=Image+1', thumb: 'https://placehold.co/150x100/1A202C/FFFFFF?text=Image+1' },
    ]
  },
  {
    id: 'fitness-gym',
    name: 'Fitness & Gym',
    price: 399, // Updated price
    tags: ['html'],
    type: 'website',
    pages: '2-5',
    image: '../assets/images/fitness-trainer.png',
    description: 'An energetic and modern site for personal trainers, gyms, and fitness studios.',
    useCases: ['Personal Trainers', 'Gyms & Fitness Centers', 'Yoga Studios', 'Health Coaches'],
    media: [
        { type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', thumb: 'https://placehold.co/150x100/1A202C/FFFFFF?text=Video' },
        { type: 'image', src: 'https://placehold.co/1280x720/1A202C/FFFFFF?text=Image+1', thumb: 'https://placehold.co/150x100/1A202C/FFFFFF?text=Image+1' },
    ]
  },
  {
    id: 'freelancer-portfolio',
    name: 'Freelancer Portfolio',
    price: 329, // Updated price
    tags: ['react'],
    type: 'portfolio',
    pages: '1',
    image: '../assets/images/freelancer-portfolio.png',
    description: 'A sleek, modern portfolio to showcase your work and attract clients.',
    useCases: ['Developers', 'Designers', 'Writers', 'Consultants'],
    media: [
        { type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', thumb: 'https://placehold.co/150x100/1A202C/FFFFFF?text=Video' },
        { type: 'image', src: 'https://placehold.co/1280x720/1A202C/FFFFFF?text=Image+1', thumb: 'https://placehold.co/150x100/1A202C/FFFFFF?text=Image+1' },
    ]
  },
  {
    id: 'one-product-store',
    name: 'One Product Store',
    price: 399, // Updated price
    tags: ['html'],
    type: 'website',
    pages: '1',
    image: '../assets/images/one-product-ecommerce.png',
    description: 'A focused e-commerce template designed to sell a single flagship product.',
    useCases: ['Single Product Brands', 'Book Authors', 'Digital Products', 'Kickstarter Campaigns'],
    media: [
        { type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', thumb: 'https://placehold.co/150x100/1A202C/FFFFFF?text=Video' },
        { type: 'image', src: 'https://placehold.co/1280x720/1A202C/FFFFFF?text=Image+1', thumb: 'https://placehold.co/150x100/1A202C/FFFFFF?text=Image+1' },
    ]
  },
  {
    id: 'photography-portfolio',
    name: 'Photography Portfolio',
    price: 349, // Updated price
    tags: ['html'],
    type: 'portfolio',
    pages: '1',
    image: '../assets/images/photography-portfolio.png',
    description: 'A visually stunning, image-focused portfolio for photographers and artists.',
    useCases: ['Photographers', 'Videographers', 'Visual Artists', 'Design Agencies'],
    media: [
        { type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', thumb: 'https://placehold.co/150x100/1A202C/FFFFFF?text=Video' },
        { type: 'image', src: 'https://placehold.co/1280x720/1A202C/FFFFFF?text=Image+1', thumb: 'https://placehold.co/150x100/1A202C/FFFFFF?text=Image+1' },
    ]
  },
  {
    id: 'real-estate',
    name: 'Real Estate Listing',
    price: 399, // Updated price
    tags: ['react'],
    type: 'website',
    pages: '2-5',
    image: '../assets/images/real-estate-listing.png',
    description: 'A feature-rich template for real estate agents and property listings.',
    useCases: ['Real Estate Agents', 'Property Developers', 'Rental Agencies', 'Brokerages'],
    media: [
        { type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', thumb: 'https://placehold.co/150x100/1A202C/FFFFFF?text=Video' },
        { type: 'image', src: 'https://placehold.co/1280x720/1A202C/FFFFFF?text=Image+1', thumb: 'https://placehold.co/150x100/1A202C/FFFFFF?text=Image+1' },
    ]
  },
  {
    id: 'resume-cv',
    name: 'Resume / CV',
    price: 299, // Updated price
    tags: ['html'],
    type: 'portfolio',
    pages: '1',
    image: '../assets/images/resume-cv.png',
    description: 'A clean, professional one-page site to act as your online resume.',
    useCases: ['Job Seekers', 'Students', 'Professionals', 'Academics'],
    media: [
        { type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', thumb: 'https://placehold.co/150x100/1A202C/FFFFFF?text=Video' },
        { type: 'image', src: 'https://placehold.co/1280x720/1A202C/FFFFFF?text=Image+1', thumb: 'https://placehold.co/150x100/1A202C/FFFFFF?text=Image+1' },
    ]
  }
];
