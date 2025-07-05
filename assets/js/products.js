// This file acts as our central database for all website products.
// To add a new product, simply copy one of the objects and change the details.

export const products = [ // Added export
  {
    id: 'cafe-business',
    name: 'Cafe & Small Business',
    price: 349,
    tags: ['html'],
    type: 'website',
    pages: '2-5',
    image: '../assets/images/cafe-small-business.png',
    description: 'A charming template perfect for local cafes, bakeries, and small shops.',
    useCases: ['Local Cafes', 'Bakeries & Sweet Shops', 'Small Boutiques', 'Artisan Stores'],
    media: [
      { type: 'youtube', src: 'https://www.youtube.com/embed/GwXNrIcBaUw', thumb: '../assets/images/cafe-video-thumb.png' },
      { type: 'image', src: '../assets/images/cafe-home.png', thumb: '../assets/images/cafe-home.png' },
      { type: 'image', src: '../assets/images/cafe-menu.png', thumb: '../assets/images/cafe-menu.png' },
      { type: 'image', src: '../assets/images/cafe-hours.png', thumb: '../assets/images/cafe-hours.png' },
      { type: 'image', src: '../assets/images/cafe-reviews.png', thumb: '../assets/images/cafe-reviews.png' },
      { type: 'image', src: '../assets/images/not templates.png', thumb: '../assets/images/not templates.png'},
    ]
  },
  {
    id: 'event-webinar',
    name: 'Event & Webinar',
    price: 299,
    tags: ['html'],
    type: 'landing-page',
    pages: '1',
    image: '../assets/images/event-webinar.png',
    description: 'A high-converting landing page to drive registrations for your next event.',
    useCases: ['Webinar Registrations', 'Conference Sign-ups', 'Workshop Tickets', 'Product Launches'],
    media: [
        { type: 'youtube', src: 'https://www.youtube.com/embed/yLjRkPtWrhU', thumb: '../assets/images/event-home.png' },
        { type: 'image', src: '../assets/images/event-home.png', thumb: '../assets/images/event-home.png'},
        { type: 'image', src: '../assets/images/event-detail.png', thumb: '../assets/images/event-detail.png'},
        { type: 'image', src: '../assets/images/event-registration.png', thumb: '../assets/images/event-registration.png' },
        { type: 'image', src: '../assets/images/event-host.png', thumb: '../assets/images/event-host.png'},
        { type: 'image', src: '../assets/images/not templates.png', thumb: '../assets/images/not templates.png'},
    ]
  },
  {
    id: 'fitness-gym',
    name: 'Fitness & Gym',
    price: 399,
    tags: ['html'],
    type: 'website',
    pages: '2-5',
    image: '../assets/images/fitness-trainer.png',
    description: 'An energetic and modern site for personal trainers, gyms, and fitness studios.',
    useCases: ['Personal Trainers', 'Gyms & Fitness Centers', 'Yoga Studios', 'Health Coaches'],
    media: [
       { type: 'youtube', src: 'https://www.youtube.com/embed/EDfh2ALhsZY', thumb: '../assets/images/gym-home.png'},
       { type: 'image', src: '../assets/images/gym-home.png', thumb: '../assets/images/gym-home.png'},
       { type: 'image', src: '../assets/images/gym-trainer.png', thumb: '../assets/images/gym-trainer.png'},
       { type: 'image', src: '../assets/images/gym-plans.png', thumb: '../assets/images/gym-plans.png'},
       { type: 'image', src: '../assets/images/gym-connect.png', thumb: '../assets/images/gym-connect.png'},
       { type: 'image', src: '../assets/images/not templates.png', thumb: '../assets/images/not templates.png'},
    ]
  },
  {
    id: 'xyz-computers',
    name: 'Xyz-computer - contains preloader',
    price: 529,
    tags: ['html'],
    type: 'electronics shop',
    pages: '1',
    image: '../assets/images/xyz-home.png',
    description: 'A sleek, modern website give wings to your store.',
    useCases: ['Shop Oweners', 'Existing Business Persons', 'Sellers', 'Freelancers'],
    media: [
        { type: 'youtube', src: 'https://www.youtube.com/embed/He3mW8-3MWo', thumb: '../assets/images/xyz-home.png' },
        { type: 'image', src: '../assets/images/xyz-home.png', thumb: '../assets/images/xyz-home.png' },
        { type: 'image', src: '../assets/images/xyz-location.png', thumb: '../assets/images/xyz-location.png' },
        { type: 'image', src: '../assets/images/xyz-offers.png', thumb: '../assets/images/xyz-offers.png' },
        { type: 'image', src: '../assets/images/xyz-faq.png', thumb: '../assets/images/xyz-faq.png' },
        { type: 'image', src: '../assets/images/not templates.png', thumb: '../assets/images/not templates.png'},
    ]
  },
  {
    id: 'one-product-store',
    name: 'One Product Store',
    price: 399,
    tags: ['html'],
    type: 'website',
    pages: '1',
    image: '../assets/images/one-product-ecommerce.png',
    description: 'A focused e-commerce template designed to sell a single flagship product.',
    useCases: ['Single Product Brands', 'Book Authors', 'Digital Products', 'Kickstarter Campaigns'],
    media: [
       { type: 'video', src: '../assets/images/product-video.mp4', thumb: '../assets/images/product-home.png' },
       { type: 'image', src: '../assets/images/product-home.png', thumb: '../assets/images/product-home.png' },
       { type: 'image', src: '../assets/images/product-qualities.png', thumb: '../assets/images/product-qualities.png' },
       { type: 'image', src: '../assets/images/product-timer.png', thumb: '../assets/images/product-timer.png' },
       { type: 'image', src: '../assets/images/product-faq.png', thumb: '../assets/images/product-faq.png' },
       { type: 'image', src: '../assets/images/not templates.png', thumb: '../assets/images/not templates.png'}
    ]
  },
  {
    id: 'photography-portfolio',
    name: 'Photography Portfolio',
    price: 349,
    tags: ['html'],
    type: 'portfolio',
    pages: '1',
    image: '../assets/images/photography-portfolio.png',
    description: 'A visually stunning, image-focused portfolio for photographers and artists.',
    useCases: ['Photographers', 'Videographers', 'Visual Artists', 'Design Agencies'],
    media: [
       { type: 'youtube', src: 'https://www.youtube.com/embed/-ZzsbOU0uTI', thumb: '../assets/images/photo-home.png' },
       { type: 'image', src: '../assets/images/photo-home.png', thumb: '../assets/images/photo-home.png' },
       { type: 'image', src: '../assets/images/photo-services.png', thumb: '../assets/images/photo-services.png' },
       { type: 'image', src: '../assets/images/photo-work.png', thumb: '../assets/images/photo-work.png' },
       { type: 'image', src: '../assets/images/photo-person.png', thumb: '../assets/images/photo-person.png' },
       { type: 'image', src: '../assets/images/photo-contact.png', thumb: '../assets/images/photo-contact.png' },
    ]
  },
  {
    id: 'real-estate',
    name: 'Real Estate Listing',
    price: 399,
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
    price: 299,
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