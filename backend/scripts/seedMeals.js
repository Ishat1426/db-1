const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Meal = require('../models/Meal');

// Load environment variables
dotenv.config();

// Define meal data
const vegetarianMeals = [
  {
    name: 'Paneer Butter Masala',
    image: 'https://www.example.com/images/paneer-butter-masala.jpg',
    category: 'Vegetarian',
    type: 'Dinner',
    description: 'Rich and creamy curry made with paneer cubes in a tomato-based gravy',
    recipe: 'Sauté onions, add tomato puree, spices, and cream. Add paneer cubes and simmer.',
    calories: 420,
    protein: 18,
    carbs: 25,
    fat: 28,
    ingredients: ['Paneer', 'Tomatoes', 'Onions', 'Cream', 'Spices', 'Butter', 'Cashews'],
    preparationTime: 35,
    isIndian: true,
    isFeatured: true
  },
  {
    name: 'Masala Dosa',
    image: 'https://www.example.com/images/masala-dosa.jpg',
    category: 'Vegetarian',
    type: 'Breakfast',
    description: 'Crispy fermented rice crepe filled with spiced potato filling',
    recipe: 'Prepare fermented rice and lentil batter, make thin crepes, fill with potato masala.',
    calories: 350,
    protein: 8,
    carbs: 60,
    fat: 10,
    ingredients: ['Rice', 'Urad Dal', 'Potatoes', 'Onions', 'Mustard Seeds', 'Curry Leaves'],
    preparationTime: 45,
    isIndian: true,
    isFeatured: true
  },
  {
    name: 'Vegetable Biryani',
    image: 'https://www.example.com/images/veg-biryani.jpg',
    category: 'Vegetarian',
    type: 'Lunch',
    description: 'Fragrant rice dish with mixed vegetables and aromatic spices',
    recipe: 'Sauté vegetables with spices, layer with partially cooked basmati rice, dum cook.',
    calories: 450,
    protein: 12,
    carbs: 75,
    fat: 15,
    ingredients: ['Basmati Rice', 'Mixed Vegetables', 'Saffron', 'Ghee', 'Spices'],
    preparationTime: 60,
    isIndian: true,
    isFeatured: true
  },
  {
    name: 'Palak Paneer',
    image: 'https://www.example.com/images/palak-paneer.jpg',
    category: 'Vegetarian',
    type: 'Dinner',
    description: 'Cottage cheese cubes in a creamy spinach gravy',
    recipe: 'Blanch spinach, blend, sauté aromatics, add spinach puree and paneer, simmer.',
    calories: 380,
    protein: 20,
    carbs: 15,
    fat: 25,
    ingredients: ['Paneer', 'Spinach', 'Onions', 'Cream', 'Spices'],
    preparationTime: 35,
    isIndian: true
  },
  {
    name: 'Aloo Gobi',
    image: 'https://www.example.com/images/aloo-gobi.jpg',
    category: 'Vegetarian',
    type: 'Lunch',
    description: 'Dry curry made with potatoes and cauliflower',
    recipe: 'Sauté cumin seeds, add potatoes and cauliflower, cook with spices until tender.',
    calories: 280,
    protein: 6,
    carbs: 45,
    fat: 10,
    ingredients: ['Potatoes', 'Cauliflower', 'Turmeric', 'Cumin', 'Coriander'],
    preparationTime: 30,
    isIndian: true
  }
];

const nonVegetarianMeals = [
  {
    name: 'Butter Chicken',
    image: 'https://www.example.com/images/butter-chicken.jpg',
    category: 'Non-Vegetarian',
    type: 'Dinner',
    description: 'Tender chicken pieces in a rich, buttery tomato gravy',
    recipe: 'Marinate chicken, grill, prepare tomato-based gravy with butter and cream, combine.',
    calories: 550,
    protein: 35,
    carbs: 15,
    fat: 38,
    ingredients: ['Chicken', 'Tomatoes', 'Butter', 'Cream', 'Spices', 'Cashews'],
    preparationTime: 50,
    isIndian: true,
    isFeatured: true
  },
  {
    name: 'Chicken Biryani',
    image: 'https://www.example.com/images/chicken-biryani.jpg',
    category: 'Non-Vegetarian',
    type: 'Lunch',
    description: 'Fragrant rice dish with marinated chicken and aromatic spices',
    recipe: 'Marinate chicken, partially cook rice, layer and dum cook together with saffron.',
    calories: 650,
    protein: 40,
    carbs: 80,
    fat: 20,
    ingredients: ['Chicken', 'Basmati Rice', 'Yogurt', 'Saffron', 'Whole Spices', 'Fried Onions'],
    preparationTime: 75,
    isIndian: true,
    isFeatured: true
  },
  {
    name: 'Chicken Tikka Masala',
    image: 'https://www.example.com/images/chicken-tikka-masala.jpg',
    category: 'Non-Vegetarian',
    type: 'Dinner',
    description: 'Grilled chicken pieces in a creamy, spiced tomato-based sauce',
    recipe: 'Marinate chicken cubes, grill, prepare masala gravy, combine and simmer.',
    calories: 520,
    protein: 38,
    carbs: 20,
    fat: 30,
    ingredients: ['Chicken', 'Yogurt', 'Tomatoes', 'Cream', 'Garam Masala'],
    preparationTime: 60,
    isIndian: true,
    isFeatured: true
  },
  {
    name: 'Fish Curry',
    image: 'https://www.example.com/images/fish-curry.jpg',
    category: 'Non-Vegetarian',
    type: 'Lunch',
    description: 'Tangy and spicy curry made with fish fillets in a coconut-based gravy',
    recipe: 'Make spice paste, prepare gravy, add fish pieces, simmer until cooked.',
    calories: 420,
    protein: 35,
    carbs: 15,
    fat: 25,
    ingredients: ['Fish', 'Coconut Milk', 'Tamarind', 'Spices', 'Curry Leaves'],
    preparationTime: 40,
    isIndian: true
  },
  {
    name: 'Lamb Kebabs',
    image: 'https://www.example.com/images/lamb-kebabs.jpg',
    category: 'Non-Vegetarian',
    type: 'Dinner',
    description: 'Grilled minced lamb skewers with aromatic spices',
    recipe: 'Mix minced lamb with spices, form into kebabs, grill until cooked.',
    calories: 380,
    protein: 28,
    carbs: 5,
    fat: 28,
    ingredients: ['Minced Lamb', 'Onions', 'Ginger', 'Garlic', 'Garam Masala'],
    preparationTime: 45,
    isIndian: true
  }
];

async function seedMeals() {
  try {
    // Connect to MongoDB Atlas with increased timeout
    console.log('Connecting to MongoDB Atlas...');
    require('dotenv').config({ path: '../.env' });
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase server selection timeout
      socketTimeoutMS: 45000, // Increase socket timeout
      connectTimeoutMS: 30000
    });
    console.log('Connected to MongoDB Atlas.');

    // Clear existing meals collection
    console.log('Clearing existing meal data...');
    await Meal.deleteMany({});

    // Insert vegetarian meals
    console.log('Adding vegetarian meals...');
    await Meal.insertMany(vegetarianMeals);
    
    // Insert non-vegetarian meals
    console.log('Adding non-vegetarian meals...');
    await Meal.insertMany(nonVegetarianMeals);

    console.log('Database seeded successfully!');
    console.log(`Added ${vegetarianMeals.length} vegetarian meals and ${nonVegetarianMeals.length} non-vegetarian meals.`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB Atlas connection closed.');
    
  } catch (error) {
    console.error('Error seeding meals:', error);
  }
}

// Run the seed function
seedMeals(); 