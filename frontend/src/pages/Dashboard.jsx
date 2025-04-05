import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { Link } from 'react-router-dom';

const workoutCategories = [
  { id: 1, name: 'Strength Training', description: 'Build muscle and increase strength' },
  { id: 2, name: 'Cardio', description: 'Improve heart health and burn calories' },
  { id: 3, name: 'HIIT', description: 'High intensity interval training for maximum results' },
  { id: 4, name: 'Flexibility', description: 'Enhance mobility, balance and reduce injury risk' }
];

const generateWorkoutPlan = (category) => {
  // Sample workout routines based on category
  const workoutPlans = {
    'Strength Training': [
      { day: 'Monday', name: 'Upper Body Strength', duration: '60 mins', exercises: ['Bench Press (4x8)', 'Shoulder Press (3x10)', 'Lat Pulldowns (3x12)', 'Bicep Curls (3x15)', 'Tricep Extensions (3x15)'] },
      { day: 'Wednesday', name: 'Lower Body Power', duration: '60 mins', exercises: ['Squats (4x10)', 'Deadlifts (3x8)', 'Leg Press (3x12)', 'Calf Raises (3x15)', 'Leg Curls (3x12)'] },
      { day: 'Friday', name: 'Full Body Strength', duration: '60 mins', exercises: ['Push-ups (3x12)', 'Pull-ups (3x8)', 'Dumbbell Lunges (3x10/leg)', 'Shoulder Raises (3x12)', 'Plank (3x60s)'] }
    ],
    'Cardio': [
      { day: 'Monday', name: 'Endurance Run', duration: '60 mins', exercises: ['Warm-up (5 mins)', 'Steady State Jogging (40 mins)', 'Cool Down Walk (10 mins)', 'Stretching (5 mins)'] },
      { day: 'Wednesday', name: 'Interval Training', duration: '60 mins', exercises: ['Warm-up (10 mins)', 'Sprint Intervals (30s sprint, 90s walk) x 15', 'Cool Down (10 mins)', 'Stretching (5 mins)'] },
      { day: 'Friday', name: 'Cross Training', duration: '60 mins', exercises: ['Cycling (20 mins)', 'Rowing (15 mins)', 'Stair Climber (15 mins)', 'Cool Down (10 mins)'] }
    ],
    'HIIT': [
      { day: 'Monday', name: 'Total Body HIIT', duration: '45 mins', exercises: ['Warm-up (5 mins)', 'Burpees (45s work, 15s rest)', 'Mountain Climbers (45s work, 15s rest)', 'Jump Squats (45s work, 15s rest)', 'Push-ups (45s work, 15s rest)', '5 rounds with 1 min rest between rounds', 'Cool down (5 mins)'] },
      { day: 'Wednesday', name: 'Tabata Circuit', duration: '40 mins', exercises: ['Warm-up (5 mins)', 'High Knees (20s work, 10s rest)', 'Plank Jacks (20s work, 10s rest)', 'Jumping Lunges (20s work, 10s rest)', 'Push-up to Side Plank (20s work, 10s rest)', '8 rounds', 'Cool down (5 mins)'] },
      { day: 'Friday', name: 'Metabolic Conditioning', duration: '50 mins', exercises: ['Warm-up (5 mins)', 'Kettlebell Swings (30s)', 'Box Jumps (30s)', 'Battle Ropes (30s)', 'Rest (30s)', '10 rounds', 'Cool down (5 mins)'] }
    ],
    'Flexibility': [
      { day: 'Monday', name: 'Dynamic Stretching', duration: '45 mins', exercises: ['Arm Circles (2x20)', 'Hip Circles (2x20)', 'Leg Swings (2x15/leg)', 'Torso Twists (2x15)', 'Cat-Cow Stretch (2 mins)', 'Downward Dog to Cobra (10 reps)', 'World\'s Greatest Stretch (5 per side)'] },
      { day: 'Wednesday', name: 'Yoga Flow', duration: '60 mins', exercises: ['Sun Salutations (10 mins)', 'Warrior Sequence (15 mins)', 'Balance Poses (10 mins)', 'Hip Openers (10 mins)', 'Seated Poses (10 mins)', 'Savasana (5 mins)'] },
      { day: 'Friday', name: 'Static Stretching', duration: '45 mins', exercises: ['Hamstring Stretch (3x30s/leg)', 'Quad Stretch (3x30s/leg)', 'Chest & Shoulder Stretch (3x30s)', 'Hip Flexor Stretch (3x30s/side)', 'Spinal Twist (3x30s/side)', 'Child\'s Pose (2 mins)'] }
    ]
  };
  
  return workoutPlans[category] || workoutPlans['Strength Training'];
};

const generateMealPlan = (goal) => {
  // Sample meal plans based on fitness goal
  const mealPlans = {
    'Strength Training': [
      { day: 'Monday', meals: [
        { name: 'Greek Yogurt with Berries and Nuts', calories: 320, description: 'High-protein Greek yogurt with mixed berries and almonds' },
        { name: 'Grilled Chicken with Quinoa and Vegetables', calories: 450, description: 'Lean protein with complex carbs and fiber-rich vegetables' },
        { name: 'Salmon with Sweet Potato and Broccoli', calories: 550, description: 'Omega-3 rich salmon with complex carbs and green vegetables' }
      ]},
      { day: 'Tuesday', meals: [
        { name: 'Protein Oatmeal with Banana', calories: 350, description: 'Oats with protein powder, banana, and a tablespoon of almond butter' },
        { name: 'Turkey and Avocado Wrap', calories: 420, description: 'Whole grain wrap with lean turkey, avocado, and fresh vegetables' },
        { name: 'Beef Stir-Fry with Brown Rice', calories: 520, description: 'Lean beef with mixed vegetables and brown rice' }
      ]}
    ],
    'Cardio': [
      { day: 'Monday', meals: [
        { name: 'Fruit Smoothie with Protein', calories: 290, description: 'Mixed berries, banana, spinach, protein powder, and almond milk' },
        { name: 'Mediterranean Salad with Chicken', calories: 380, description: 'Mixed greens, cucumber, tomatoes, olives, feta, and grilled chicken' },
        { name: 'Baked Fish with Roasted Vegetables', calories: 420, description: 'White fish with a variety of colorful roasted vegetables' }
      ]},
      { day: 'Tuesday', meals: [
        { name: 'Whole Grain Toast with Avocado and Eggs', calories: 310, description: 'Complex carbs, healthy fats, and protein' },
        { name: 'Lentil Soup with Side Salad', calories: 340, description: 'Protein-rich lentils with fresh garden salad' },
        { name: 'Grilled Tofu with Quinoa and Steamed Vegetables', calories: 400, description: 'Plant-based protein with complex carbs' }
      ]}
    ],
    'HIIT': [
      { day: 'Monday', meals: [
        { name: 'Protein Pancakes with Fruit', calories: 330, description: 'Banana and protein powder pancakes with mixed berries' },
        { name: 'Tuna Salad with Whole Grain Crackers', calories: 380, description: 'Lean protein with complex carbs for sustained energy' },
        { name: 'Grilled Chicken with Quinoa and Roasted Vegetables', calories: 480, description: 'Balanced meal with lean protein and complex carbs' }
      ]},
      { day: 'Tuesday', meals: [
        { name: 'Egg White Omelette with Vegetables', calories: 280, description: 'High protein, low fat breakfast with nutrient-rich vegetables' },
        { name: 'Chicken and Vegetable Soup', calories: 350, description: 'Lean protein with vegetables in a clear broth' },
        { name: 'Baked Salmon with Sweet Potato and Asparagus', calories: 470, description: 'Omega-3 rich fish with complex carbs and green vegetables' }
      ]}
    ],
    'Flexibility': [
      { day: 'Monday', meals: [
        { name: 'Chia Seed Pudding with Berries', calories: 290, description: 'Anti-inflammatory seeds with antioxidant-rich berries' },
        { name: 'Vegetable Soup with Side Salad', calories: 320, description: 'Hydrating soup with nutrient-dense vegetables' },
        { name: 'Baked Chicken with Quinoa and Steamed Vegetables', calories: 450, description: 'Clean proteins and carbs with anti-inflammatory properties' }
      ]},
      { day: 'Tuesday', meals: [
        { name: 'Green Smoothie Bowl', calories: 310, description: 'Spinach, kale, banana, avocado topped with seeds and berries' },
        { name: 'Lentil and Vegetable Salad', calories: 350, description: 'Plant-based protein with colorful vegetables' },
        { name: 'Grilled Fish with Brown Rice and Roasted Vegetables', calories: 430, description: 'Lean protein with fiber-rich sides' }
      ]}
    ]
  };
  
  return mealPlans[goal] || mealPlans['Strength Training'];
};

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { loading, getAllWorkouts, getFeaturedMeals } = useApi();
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [mealPlan, setMealPlan] = useState([]);
  const [steps, setSteps] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  
  // Calculate calories burned based on steps (roughly 0.04 calories per step for average person)
  const calculateCaloriesFromSteps = (steps) => {
    return Math.round(steps * 0.04);
  };

  // Handle step input change
  const handleStepsChange = (e) => {
    const newSteps = parseInt(e.target.value) || 0;
    setSteps(newSteps);
    const stepCalories = calculateCaloriesFromSteps(newSteps);
    
    // Add workout calories (estimated at 300 for a typical hour-long session)
    const workoutCalories = 300;
    setCaloriesBurned(stepCalories + workoutCalories);
  };
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) return;

      try {
        // For a real application, fetch actual data from API
        const workoutData = await getAllWorkouts();
        if (workoutData && workoutData.length > 0) {
          setWorkouts(workoutData.slice(0, 3));
        } else {
          // Empty state, no prefed data
          setWorkouts([]);
        }
        
        const mealData = await getFeaturedMeals();
        if (mealData && mealData.length > 0) {
          setMeals(mealData.slice(0, 3));
        } else {
          // Empty state, no prefed data
          setMeals([]);
        }
        
        // Check if user has selected a workout category before
        if (user?.fitnessGoal) {
          const category = user.fitnessGoal;
          setSelectedCategory(category);
          setWorkoutPlan(generateWorkoutPlan(category));
          setMealPlan(generateMealPlan(category));
        } else if (isAuthenticated && user?.role === 'premium') {
          // Ask for category if premium user but no category selected
          setShowCategoryDialog(true);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Empty arrays for fallback
        setWorkouts([]);
        setMeals([]);
      }
    };
    
    fetchUserData();
  }, [isAuthenticated, user, getAllWorkouts, getFeaturedMeals]);
  
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setWorkoutPlan(generateWorkoutPlan(category));
    setMealPlan(generateMealPlan(category));
    setShowCategoryDialog(false);
  };
  
  // Membership unlock card component
  const MembershipCard = () => (
    <div className="bg-gradient-to-r from-blue-700 to-purple-800 rounded-xl p-6 my-8 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-2">Unlock Premium Features</h3>
      <p className="text-white/80 mb-4">
        Get personalized workout plans, custom meal recommendations, and advanced tracking with a premium membership.
      </p>
      <Link 
        to="/membership"
        className="inline-block bg-white text-blue-700 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
      >
        Upgrade to Premium
      </Link>
    </div>
  );
  
  // Goal selection dialog
  const GoalSelectionDialog = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full">
        <h3 className="text-xl font-bold text-white mb-4">What's your fitness goal?</h3>
        <p className="text-gray-300 mb-6">Select a category to get personalized recommendations:</p>
        
        <div className="space-y-3">
          {workoutCategories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.name)}
              className="w-full text-left bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors"
            >
              <h4 className="text-white font-medium">{category.name}</h4>
              <p className="text-gray-300 text-sm">{category.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="pt-16 px-4 max-w-7xl mx-auto">
      <div className="my-8 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white"
        >
          Welcome back, {user?.name || 'Fitness Enthusiast'}!
        </motion.h1>
        <p className="text-gray-300 mt-2">Your fitness journey continues here</p>
      </div>
      
      {/* Show category selection dialog */}
      {showCategoryDialog && <GoalSelectionDialog />}
      
      {/* Show membership card for free users */}
      {isAuthenticated && !user?.isMember && <MembershipCard />}
      
      {/* Stats Overview */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-medium text-gray-300 mb-2">Step Tracker</h3>
          <input
            type="number"
            value={steps}
            onChange={handleStepsChange}
            placeholder="Enter steps"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-400 mt-2">Calories burned from steps: {calculateCaloriesFromSteps(steps)}</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-medium text-gray-300 mb-2">Calories Today</h3>
          <p className="text-3xl font-bold text-white">{caloriesBurned}</p>
          <p className="text-sm text-gray-400 mt-2">From steps and recommended workouts</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-medium text-gray-300 mb-2">Membership</h3>
          <p className="text-3xl font-bold text-white">
            {user?.isMember ? 'Premium' : 'Basic'}
          </p>
          {!user?.isMember && (
            <Link 
              to="/membership"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg mt-4 text-sm hover:bg-blue-700 transition-colors"
            >
              Upgrade Now
            </Link>
          )}
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Workouts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white">Upcoming Workouts</h2>
            <Link to="/workouts" className="text-blue-400 text-sm hover:text-blue-300">
              View All
            </Link>
          </div>
          
          {/* For free users, show upgrade prompt */}
          {isAuthenticated && !user?.isMember ? (
            <div className="bg-gray-800 rounded-xl p-6">
              <p className="text-gray-300 mb-3">Unlock personalized workout plans with a premium membership.</p>
              <Link 
                to="/membership"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Get Premium
              </Link>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              {workoutPlan.length > 0 ? (
                <div className="divide-y divide-gray-700">
                  {workoutPlan.map((workout, index) => (
                    <div key={index} className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-white font-medium">{workout.name}</h3>
                        <span className="text-gray-400 text-sm">{workout.day} • {workout.duration}</span>
                      </div>
                      <div className="text-gray-300 text-sm">
                        <ul className="list-disc pl-5 space-y-1">
                          {workout.exercises.map((exercise, i) => (
                            <li key={i}>{exercise}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedCategory ? (
                <div className="p-6 text-center text-gray-400">
                  Loading workout recommendations...
                </div>
              ) : (
                <div className="p-6 text-center text-gray-400">
                  Select a fitness goal to get personalized workout recommendations.
                </div>
              )}
            </div>
          )}
        </motion.div>
        
        {/* Meal Plan */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white">Today's Recommended Meals</h2>
            <Link to="/meals" className="text-blue-400 text-sm hover:text-blue-300">
              View All
            </Link>
          </div>
          
          {/* For free users, show upgrade prompt */}
          {isAuthenticated && !user?.isMember ? (
            <div className="bg-gray-800 rounded-xl p-6">
              <p className="text-gray-300 mb-3">Unlock personalized meal plans with a premium membership.</p>
              <Link 
                to="/membership"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Get Premium
              </Link>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              {mealPlan.length > 0 ? (
                <div className="divide-y divide-gray-700">
                  {mealPlan[0].meals.map((meal, index) => (
                    <div key={index} className="p-4">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-white font-medium">{meal.name}</h3>
                        <span className="text-gray-400 text-sm">{meal.calories} calories</span>
                      </div>
                      <p className="text-gray-300 text-sm">{meal.description}</p>
                    </div>
                  ))}
                </div>
              ) : selectedCategory ? (
                <div className="p-6 text-center text-gray-400">
                  Loading meal recommendations...
                </div>
              ) : (
                <div className="p-6 text-center text-gray-400">
                  Select a fitness goal to get personalized meal recommendations.
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 