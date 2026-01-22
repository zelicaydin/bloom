// PLACEHOLDER IMAGES: Currently using category images from Home page
// To replace with real product photos, update the 'image' field for each product below
// Category images: cat1.png (Skincare), cat2.png (Body Care), cat3.png (Hair Care), 
//                  cat4.png (Wellness), cat5.png (Candles), cat6.png (Oils)

const products = [
  {
    id: '1',
    name: 'Organic Shampoo',
    price: 18,
    brand: 'Bloom Labs',
    type: 'shampoo',
    popularity: 120,
    createdAt: '2026-01-05',
    markers: ['sustainablePackaging', 'organicIngredients'],
    rating: 4.5,
    reviews: 25,
    image: '/categories/cat3.png', // PLACEHOLDER: Hair Care category image
  },
  {
    id: '2',
    name: 'Hydrating Body Wash',
    price: 22,
    brand: 'Pure Earth',
    type: 'body-wash',
    popularity: 90,
    createdAt: '2026-01-02',
    markers: ['organicIngredients', 'recyclable'],
    rating: 3,
    reviews: 12,
    image: '/categories/cat2.png', // PLACEHOLDER: Body Care category image
  },
  {
    id: '3',
    name: 'Botanical Face Cream',
    price: 45,
    brand: 'Bloom Labs',
    type: 'face-care',
    popularity: 160,
    createdAt: '2025-12-20',
    markers: ['crueltyFree'],
    rating: 5,
    reviews: 40,
    image: '/categories/cat1.png', // PLACEHOLDER: Skincare category image
  },
  {
    id: '4',
    name: 'Botanical Face Cream',
    price: 45,
    brand: 'Prada',
    type: 'Blended',
    popularity: 160,
    createdAt: '2025-12-20',
    markers: ['organicIngredients', 'crueltyFree'],
    image: '/categories/cat1.png', // PLACEHOLDER: Skincare category image
  },
  {
    id: '5',
    name: 'Blood Orange Body Lotion',
    price: 45,
    brand: 'Prada',
    type: 'Single Origin',
    popularity: 160,
    createdAt: '2025-12-20',
    markers: ['sustainablePackaging', 'recyclable'],
    image: '/categories/cat2.png', // PLACEHOLDER: Body Care category image
  },
  {
    id: '6',
    name: 'Blood Orange Body Lotion',
    price: 45,
    brand: 'Prada',
    type: 'Single Origin',
    popularity: 160,
    createdAt: '2025-12-20',
    image: '/categories/cat2.png', // PLACEHOLDER: Body Care category image
  },
  {
    id: '7',
    name: 'Blood Orange Body Lotion',
    price: 45,
    brand: 'Prada',
    type: 'Single Origin',
    popularity: 160,
    createdAt: '2025-12-20',
    markers: ['organicIngredients'],
    image: '/categories/cat2.png', // PLACEHOLDER: Body Care category image
  },
  {
    id: '8',
    name: 'Blood Orange Body Lotion',
    price: 45,
    brand: 'Prada',
    type: 'Single Origin',
    popularity: 160,
    createdAt: '2025-12-20',
    image: '/categories/cat2.png', // PLACEHOLDER: Body Care category image
  },
  {
    id: '9',
    name: 'Blood Orange Body Lotion',
    price: 45,
    brand: 'Prada',
    type: 'Single Origin',
    popularity: 160,
    createdAt: '2025-12-20',
    rating: 3,
    reviews: 12,
    markers: ['crueltyFree', 'recyclable'],
    image: '/categories/cat2.png', // PLACEHOLDER: Body Care category image
  },
];

export default products;
