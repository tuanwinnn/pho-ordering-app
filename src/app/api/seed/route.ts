import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';

const menuItems = [
  // Appetizers
  {
    name: 'Gỏi Cuốn',
    description: 'Fresh spring rolls with shrimp, pork, vermicelli, and herbs',
    price: 6.99,
    category: 'Appetizers',
    image: '🥢',
    rating: 4.8,
    prepTime: '5-10 min'
  },
  {
    name: 'Chả Giò',
    description: 'Crispy egg rolls filled with pork, shrimp, and vegetables',
    price: 7.99,
    category: 'Appetizers',
    image: '🥟',
    rating: 4.7,
    prepTime: '10-12 min'
  },
  {
    name: 'Cánh Gà Chiên',
    description: 'Vietnamese-style crispy chicken wings with fish sauce',
    price: 8.99,
    category: 'Appetizers',
    image: '🍗',
    rating: 4.6,
    prepTime: '12-15 min'
  },
  // Pho
  {
    name: 'Phở Tái',
    description: 'Rare beef pho with rice noodles in aromatic beef broth',
    price: 12.99,
    category: 'Pho',
    image: '🍜',
    rating: 4.9,
    prepTime: '15-20 min'
  },
  {
    name: 'Phở Gà',
    description: 'Chicken pho with tender chicken breast and rice noodles',
    price: 11.99,
    category: 'Pho',
    image: '🍲',
    rating: 4.8,
    prepTime: '15-20 min'
  },
  {
    name: 'Phở Đặc Biệt',
    description: 'Special combo pho with rare beef, brisket, tendon, and tripe',
    price: 14.99,
    category: 'Pho',
    image: '🥘',
    rating: 4.9,
    prepTime: '15-20 min'
  },
  // Bun
  {
    name: 'Bún Thịt Nướng',
    description: 'Grilled pork over vermicelli with fresh herbs and fish sauce',
    price: 12.99,
    category: 'Bun',
    image: '🍝',
    rating: 4.7,
    prepTime: '15-18 min'
  },
  {
    name: 'Bún Chả Giò',
    description: 'Vermicelli bowl with crispy egg rolls and vegetables',
    price: 11.99,
    category: 'Bun',
    image: '🥗',
    rating: 4.6,
    prepTime: '12-15 min'
  },
  {
    name: 'Bún Bò Huế',
    description: 'Spicy beef noodle soup with lemongrass and thick vermicelli',
    price: 13.99,
    category: 'Bun',
    image: '🌶️',
    rating: 4.8,
    prepTime: '18-22 min'
  },
  // Rice Plates
  {
    name: 'Cơm Tấm Sườn',
    description: 'Broken rice with grilled pork chop, fried egg, and pickles',
    price: 12.99,
    category: 'Rice Plates',
    image: '🍚',
    rating: 4.8,
    prepTime: '15-18 min'
  },
  {
    name: 'Cơm Gà Nướng',
    description: 'Grilled lemongrass chicken over jasmine rice',
    price: 11.99,
    category: 'Rice Plates',
    image: '🍛',
    rating: 4.7,
    prepTime: '15-18 min'
  },
  {
    name: 'Cơm Chiên',
    description: 'Vietnamese fried rice with shrimp, pork, and mixed vegetables',
    price: 10.99,
    category: 'Rice Plates',
    image: '🍱',
    rating: 4.6,
    prepTime: '12-15 min'
  },
  // Vegan
  {
    name: 'Phở Chay',
    description: 'Vegetarian pho with tofu, mushrooms, and vegetable broth',
    price: 11.99,
    category: 'Vegan',
    image: '🥬',
    rating: 4.7,
    prepTime: '15-20 min'
  },
  {
    name: 'Bún Chay',
    description: 'Vermicelli with fried tofu, mushrooms, and fresh vegetables',
    price: 10.99,
    category: 'Vegan',
    image: '🥕',
    rating: 4.6,
    prepTime: '12-15 min'
  },
  {
    name: 'Cơm Chay',
    description: 'Vegan rice plate with lemongrass tofu and stir-fried vegetables',
    price: 10.99,
    category: 'Vegan',
    image: '🌱',
    rating: 4.5,
    prepTime: '15-18 min'
  },
  // Yellow Noodle Soup
  {
    name: 'Mì Vịt Tiềm',
    description: 'Egg noodle soup with braised duck and aromatic broth',
    price: 14.99,
    category: 'Yellow Noodle Soup',
    image: '🦆',
    rating: 4.9,
    prepTime: '20-25 min'
  },
  {
    name: 'Mì Hoành Thánh',
    description: 'Wonton noodle soup with shrimp and pork dumplings',
    price: 12.99,
    category: 'Yellow Noodle Soup',
    image: '🥟',
    rating: 4.8,
    prepTime: '18-22 min'
  },
  {
    name: 'Mì Xào Giòn',
    description: 'Crispy pan-fried noodles with seafood and vegetables',
    price: 13.99,
    category: 'Yellow Noodle Soup',
    image: '🍤',
    rating: 4.7,
    prepTime: '18-20 min'
  },
  // Boba
  {
    name: 'Classic Milk Tea',
    description: 'Traditional bubble tea with tapioca pearls',
    price: 5.99,
    category: 'Boba',
    image: '🧋',
    rating: 4.8,
    prepTime: '5-8 min'
  },
  {
    name: 'Taro Milk Tea',
    description: 'Creamy taro-flavored milk tea with boba',
    price: 6.49,
    category: 'Boba',
    image: '🟣',
    rating: 4.7,
    prepTime: '5-8 min'
  },
  {
    name: 'Thai Tea',
    description: 'Sweet and creamy Thai iced tea with boba pearls',
    price: 5.99,
    category: 'Boba',
    image: '🧡',
    rating: 4.9,
    prepTime: '5-8 min'
  }
];

export async function GET() {
  try {
    await connectDB();
    
    // Clear existing items
    await MenuItem.deleteMany({});
    
    // Insert new items
    await MenuItem.insertMany(menuItems);
    
    return NextResponse.json({ 
      message: 'Database seeded successfully!',
      count: menuItems.length 
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}