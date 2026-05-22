import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const products = [
  {
    title: "Wireless Bluetooth Headphones",
    description: "Experience premium sound with high fidelity, rich bass, and up to 40 hours of battery life. Perfect for work, travel, and fitness.",
    price: 1499,
    discount: 40, // 2499 -> 1499 is roughly 40% discount
    category: "electronics",
    brand: "SoundWave",
    stock: 35,
    badge: "SALE",
    images: ["🎧"],
    ratings: { rate: 4.5, count: 128 }
  },
  {
    title: "Men's Casual T-Shirt",
    description: "Crafted from ultra-soft premium cotton, this t-shirt offers a relaxed, stylish fit ideal for everyday casual wear.",
    price: 499,
    discount: 37, // 799 -> 499 is roughly 37%
    category: "fashion",
    brand: "AeroWear",
    stock: 50,
    badge: "NEW",
    images: ["👕"],
    ratings: { rate: 4.2, count: 85 }
  },
  {
    title: "Smart LED Desk Lamp",
    description: "Sleek adjustable LED lamp featuring multiple color temperatures, stepless dimming, and an integrated USB charging port.",
    price: 899,
    discount: 30, // 1299 -> 899 is roughly 30%
    category: "home",
    brand: "LuxLumen",
    stock: 20,
    badge: "SALE",
    images: ["💡"],
    ratings: { rate: 4.7, count: 64 }
  },
  {
    title: "Running Sports Shoes",
    description: "Designed for champions. Lightweight mesh upper provides breathability while custom responsive cushioning delivers ultimate energy return.",
    price: 2299,
    discount: 34, // 3499 -> 2299 is roughly 34%
    category: "sports",
    brand: "ApexRun",
    stock: 15,
    badge: "HOT",
    images: ["👟"],
    ratings: { rate: 4.6, count: 210 }
  },
  {
    title: "Smartphone Stand Holder",
    description: "Sturdy aluminum desk stand compatible with all smartphones and tablets. Multi-angle adjustable with anti-slip rubber pads.",
    price: 349,
    discount: 41, // 599 -> 349 is roughly 41%
    category: "electronics",
    brand: "FlexiGrip",
    stock: 45,
    badge: "NEW",
    images: ["📱"],
    ratings: { rate: 4.1, count: 47 }
  },
  {
    title: "Women's Ethnic Kurti",
    description: "Elegant traditional kurti tailored from breathable high-quality rayon fabric. Perfect for regular office wear and festive gatherings.",
    price: 699,
    discount: 30, // 999 -> 699 is roughly 30%
    category: "fashion",
    brand: "Vastra",
    stock: 28,
    badge: "",
    images: ["👘"],
    ratings: { rate: 4.4, count: 92 }
  },
  {
    title: "Yoga Mat Premium",
    description: "Extra thick high-density eco-friendly TPE mat featuring double-sided non-slip texture, providing excellent joint cushioning and support.",
    price: 799,
    discount: 33, // 1199 -> 799 is roughly 33%
    category: "sports",
    brand: "ZenStretch",
    stock: 25,
    badge: "SALE",
    images: ["🧘"],
    ratings: { rate: 4.8, count: 176 }
  },
  {
    title: "Stainless Steel Water Bottle",
    description: "Double-walled vacuum insulated bottle that keeps beverages ice-cold for 24 hours or piping-hot for 12. Leak-proof and BPA-free.",
    price: 399,
    discount: 38, // 649 -> 399 is roughly 38%
    category: "home",
    brand: "HydroVibe",
    stock: 60,
    badge: "NEW",
    images: ["🍶"],
    ratings: { rate: 4.3, count: 55 }
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for data seeding...");

    // Clean existing catalog
    await Product.deleteMany();
    console.log("Cleared existing products.");

    // Seed products
    const createdProducts = await Product.insertMany(products);
    console.log(`Seeded ${createdProducts.length} products successfully.`);

    // Clear existing users
    await User.deleteMany();
    console.log("Cleared existing users.");

    // Create an Admin user
    const adminUser = new User({
      name: "ShopKart Admin",
      email: "admin@shopkart.com",
      password: "adminpassword123", // Will be automatically hashed in pre-save hook
      role: "admin",
      address: {
        street: "123 Admin Lane",
        city: "Tech City",
        state: "Karnataka",
        zip: "560001",
        country: "India"
      }
    });
    await adminUser.save();
    console.log("Admin account created successfully (admin@shopkart.com / adminpassword123).");

    // Create a regular User
    const standardUser = new User({
      name: "Rohan Kumar",
      email: "rohan@gmail.com",
      password: "userpassword123", // Will be automatically hashed in pre-save hook
      role: "user",
      address: {
        street: "45 Shopping Street",
        city: "Bengaluru",
        state: "Karnataka",
        zip: "560034",
        country: "India"
      }
    });
    await standardUser.save();
    console.log("User account created successfully (rohan@gmail.com / userpassword123).");

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
