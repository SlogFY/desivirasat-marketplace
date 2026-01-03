import thekua from "@/assets/products/thekua.jpg";
import bambooBasket from "@/assets/products/bamboo-basket.jpg";
import terracottaPot from "@/assets/products/terracotta-pot.jpg";
import handwovenFabric from "@/assets/products/handwoven-fabric.jpg";
import brassDiya from "@/assets/products/brass-diya.jpg";
import pickleJars from "@/assets/products/pickle-jars.jpg";
import juteBag from "@/assets/products/jute-bag.jpg";

import { Product, Category } from "@/types";

export const products: Product[] = [
  {
    id: "1",
    name: "Bihar ka Thekua",
    nameHindi: "बिहार का ठेकुआ",
    description: "Traditional Bihari sweet made with wheat flour, jaggery, and ghee. Hand-pressed with intricate patterns, perfect for festivals and rituals.",
    price: 249,
    originalPrice: 299,
    image: thekua,
    category: "food",
    artisan: "Savitri Devi",
    village: "Darbhanga",
    state: "Bihar",
    inStock: true,
    rating: 4.8,
    reviews: 124,
    tags: ["sweets", "traditional", "festival"]
  },
  {
    id: "2",
    name: "Handwoven Bamboo Basket",
    nameHindi: "हस्तनिर्मित बांस की टोकरी",
    description: "Intricately woven bamboo basket by skilled artisans. Perfect for storage, gifting, or home décor. Each piece is unique.",
    price: 599,
    originalPrice: 749,
    image: bambooBasket,
    category: "crafts",
    artisan: "Ramesh Kumar",
    village: "Madhubani",
    state: "Bihar",
    inStock: true,
    rating: 4.9,
    reviews: 89,
    tags: ["eco-friendly", "storage", "decor"]
  },
  {
    id: "3",
    name: "Terracotta Matka",
    nameHindi: "मिट्टी का मटका",
    description: "Traditional clay pot with hand-painted designs. Keeps water naturally cool and adds earthy charm to your space.",
    price: 449,
    image: terracottaPot,
    category: "pottery",
    artisan: "Mohan Prajapati",
    village: "Gorakhpur",
    state: "Uttar Pradesh",
    inStock: true,
    rating: 4.7,
    reviews: 156,
    tags: ["pottery", "cooling", "traditional"]
  },
  {
    id: "4",
    name: "Block Print Cotton Fabric",
    nameHindi: "ब्लॉक प्रिंट कपड़ा",
    description: "Hand block printed cotton fabric using natural dyes. Perfect for making suits, curtains, or table linens.",
    price: 899,
    originalPrice: 1099,
    image: handwovenFabric,
    category: "textiles",
    artisan: "Fatima Bibi",
    village: "Jaipur",
    state: "Rajasthan",
    inStock: true,
    rating: 4.6,
    reviews: 78,
    tags: ["fabric", "natural-dye", "handloom"]
  },
  {
    id: "5",
    name: "Brass Peacock Diya",
    nameHindi: "पीतल का मोर दिया",
    description: "Ornate brass oil lamp with peacock design. Handcrafted by traditional metalworkers. Perfect for puja or décor.",
    price: 1299,
    originalPrice: 1599,
    image: brassDiya,
    category: "crafts",
    artisan: "Shankar Vishwakarma",
    village: "Moradabad",
    state: "Uttar Pradesh",
    inStock: true,
    rating: 4.9,
    reviews: 203,
    tags: ["brass", "puja", "decor"]
  },
  {
    id: "6",
    name: "Homemade Mango Pickle",
    nameHindi: "घर का आम का अचार",
    description: "Authentic homemade mango pickle made with traditional recipe. Sun-dried and aged for perfect taste.",
    price: 349,
    image: pickleJars,
    category: "food",
    artisan: "Kamla Devi",
    village: "Varanasi",
    state: "Uttar Pradesh",
    inStock: true,
    rating: 4.8,
    reviews: 312,
    tags: ["pickle", "homemade", "traditional"]
  },
  {
    id: "7",
    name: "Handwoven Jute Bag",
    nameHindi: "हस्तनिर्मित जूट बैग",
    description: "Eco-friendly jute shopping bag with traditional weave patterns. Sturdy, reusable, and stylish.",
    price: 399,
    originalPrice: 499,
    image: juteBag,
    category: "accessories",
    artisan: "Lakshmi Mahto",
    village: "Cooch Behar",
    state: "West Bengal",
    inStock: true,
    rating: 4.5,
    reviews: 67,
    tags: ["eco-friendly", "bag", "sustainable"]
  },
  {
    id: "8",
    name: "Traditional Spice Box",
    nameHindi: "मसाला डब्बा",
    description: "Handcrafted brass spice box with seven compartments. A kitchen essential with traditional craftsmanship.",
    price: 799,
    image: brassDiya,
    category: "kitchen",
    artisan: "Raju Lohar",
    village: "Moradabad",
    state: "Uttar Pradesh",
    inStock: false,
    rating: 4.7,
    reviews: 145,
    tags: ["kitchen", "brass", "storage"]
  }
];

export const categories: Category[] = [
  {
    id: "food",
    name: "Desi Food",
    nameHindi: "देसी खाना",
    description: "Traditional sweets, pickles, and homemade delicacies",
    image: thekua,
    productCount: 24
  },
  {
    id: "crafts",
    name: "Handicrafts",
    nameHindi: "हस्तशिल्प",
    description: "Handmade crafts from skilled village artisans",
    image: bambooBasket,
    productCount: 56
  },
  {
    id: "pottery",
    name: "Pottery & Terracotta",
    nameHindi: "मिट्टी के बर्तन",
    description: "Traditional clay and terracotta products",
    image: terracottaPot,
    productCount: 32
  },
  {
    id: "textiles",
    name: "Textiles & Fabrics",
    nameHindi: "कपड़े",
    description: "Handwoven and block-printed textiles",
    image: handwovenFabric,
    productCount: 41
  }
];
