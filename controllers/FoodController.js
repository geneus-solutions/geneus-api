import Food from '../models/Food.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { configDotenv } from 'dotenv';
import { findOrCreateFood } from '../services/foodItemServices/foodOrCreateFood.js';

configDotenv()
// const postFood =  async (req, res) => {
  
//   try {
//         const { userId } = req.user; // Extract userId from the request
//         console.log('this is userId', userId);
//         const { breakfast, lunch, dinner } = req.body;
//         const userExists = await User.findById(userId);

//         if (!userExists) {
//           return res.status(404).json({ message: "User not found" });
//         }

//         const currentDate = new Date();
//         const dateFormat = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

//         const startOfDay = new Date(dateFormat); // Midnight of the day
//         const endOfDay = new Date(dateFormat);
//         endOfDay.setDate(endOfDay.getDate() + 1); // Midnight of next day

//         let foodData = await Food.findOne({ user:userId,createdAt: { $gte: startOfDay,$lt: endOfDay}});

//         // console.log("foodData post : ", foodData)

//         const formatItems = (mealItems) => {
//           if (!mealItems) return [];
//           if (Array.isArray(mealItems)) {
//               return mealItems.map(item => ({ item, quantity: 1 }));
//           }
//           return [{ item: mealItems, quantity: 1 }];
//         };

//         if (foodData) {
//             if (breakfast) {
//                 const formattedBreakfast = formatItems(breakfast);
//                 formattedBreakfast.forEach(newItem => {
//                     const existingItem = foodData.breakfast.find(item => item.item.toString() === newItem.item);
//                     if (existingItem) {
//                         existingItem.quantity += newItem.quantity;
//                     } else {
//                         foodData.breakfast.push(newItem);
//                     }
//                 });
//             }

//             if (lunch) {

//               const formattedLunch = formatItems(lunch);

//               formattedLunch.forEach(newItem => {
//                 const existingItem = foodData.lunch.find(item => item.item.toString() === newItem.item);
//                 if (existingItem) {
//                     existingItem.quantity += newItem.quantity;
//                 } else {
//                     foodData.lunch.push(newItem);
//                 }
//               });
              
//             }

//             if (dinner) {
//                 const formattedDinner = formatItems(dinner);
//                 formattedDinner.forEach(newItem => {
//                     const existingItem = foodData.dinner.find(item => item.item.toString() === newItem.item);
//                     if (existingItem) {
//                         existingItem.quantity += newItem.quantity;
//                     } else {
//                         foodData.dinner.push(newItem);
//                     }
//                 });
//             }

//             const updatedFood = await foodData.save();
//             console.log('this is updated Food', updatedFood);

//             return res.status(200).json(updatedFood);

//         } else {
//             const newFood = new Food({
//                 user:userId,
//                 breakfast: formatItems(breakfast),
//                 lunch: formatItems(lunch),
//                 dinner: formatItems(dinner)
//             });

//             await newFood.save();
//             return res.status(201).json(newFood);
//         }
//     } catch (error) {
//         return res.status(500).json({ message: error.message });
//     }
// }

const postFood = async (req, res) => {
  try {
    const { userId } = req.user;
    const { breakfast, lunch, dinner } = req.body;

    // ----- 1. Check user -----
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // ----- 2. Get today's IST date -----
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // ----- 3. Find today's food log -----
    let foodData = await Food.findOne({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // ----- 4. Convert food names -> itemIds -----
    const formatItems = async (mealItems) => {
      if (!mealItems) return [];

      const itemsArray = Array.isArray(mealItems) ? mealItems : [mealItems];
      const formatted = [];

      for (const foodName of itemsArray) {
        const itemId = await findOrCreateFood(foodName);

        formatted.push({
          item: itemId,
          quantity: 1
        });
      }

      return formatted;
    };

    const formattedBreakfast = await formatItems(breakfast);
    const formattedLunch = await formatItems(lunch);
    const formattedDinner = await formatItems(dinner);

    // ----- 5. If record exists → update -----
    if (foodData) {

      const mergeMeal = (existingMeal, newMeal) => {
        newMeal.forEach(newItem => {
          const existingItem = existingMeal.find(item =>
            item.item.equals(newItem.item)
          );

          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            existingMeal.push(newItem);
          }
        });
      };

      if (formattedBreakfast.length)
        mergeMeal(foodData.breakfast, formattedBreakfast);

      if (formattedLunch.length)
        mergeMeal(foodData.lunch, formattedLunch);

      if (formattedDinner.length)
        mergeMeal(foodData.dinner, formattedDinner);

      await foodData.save();

      return res.status(200).json({
        message: "Food updated successfully",
        food: foodData
      });
    }

    // ----- 6. If no record → create -----
    const newFood = await Food.create({
      user: userId,
      date: startOfDay,
      breakfast: formattedBreakfast,
      lunch: formattedLunch,
      dinner: formattedDinner
    });

    return res.status(201).json({
      message: "Food added successfully",
      food: newFood
    });

  } catch (error) {
    console.error("postFood Error:", error);
    return res.status(500).json({ message: error.message });
  }
};
 
const getFoodById =  async (req, res) => {
  
  try {

        const { id } = req.params;
        const { date } = req.query; // Extract date from query parameters
        console.log('this is date', date)
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const Today = date ? new Date(date) : new Date();
        const dateFormat = Today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const startOfDay = new Date(dateFormat); // Midnight of the day
        const endOfDay = new Date(dateFormat);
        endOfDay.setDate(endOfDay.getDate() + 1); // Midnight of next day
     
        const foodData = await Food.findOne({ user: id ,createdAt: { $gte: startOfDay,$lt: endOfDay}})
            .populate('user', '_id name mobile food')  
            .populate('breakfast.item')  
            .populate('lunch.item')     
            .populate('dinner.item')
            .lean();    

        if (!foodData) {
          const user = await User.findById(id, { _id: 1, name: 1, mobile: 1 , food: 1 });
            return res.status(200).json({ 
              user: user,
              breakfast: [],
              lunch: [],
              dinner: [],
              snacks: [],
              totalCalories:0,
              totalProtein : 0,
              totalCarbs : 0,
              totalFat : 0
             });
        }

        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;

     
        const calculateNutrients = (mealItems) => {
            return mealItems.reduce((total, meal) => {
                const quantity = meal.quantity || 1;
                return {
                    calories: total.calories + (meal.item.calories || 0) * quantity,
                    protein: total.protein + (meal.item.protein || 0) * quantity,
                    carbs: total.carbs + (meal.item.carbs || 0) * quantity,
                    fat: total.fat + (meal.item.fat || 0) * quantity
                };
            }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
        };

       
        const meals = ['breakfast', 'lunch', 'dinner'];
        meals.forEach(meal => {
            if (foodData[meal]) {
                const mealNutrients = calculateNutrients(foodData[meal]);
                totalCalories += mealNutrients.calories;
                totalProtein += mealNutrients.protein;
                totalCarbs += mealNutrients.carbs;
                totalFat += mealNutrients.fat;
            }
        });

        const responseData = {

          ...foodData, 
          totalCalories,
          totalProtein : Math.round(totalProtein),
          totalCarbs : Math.round(totalCarbs),
          totalFat : Math.round(totalFat)

        };
        return res.status(200).json(responseData);
    } catch (error) {
        console.error("Error fetching food data:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const updateFood = async (req, res) => {
  
  try {
    
      const { userId } = req.user; 
      const { meal, quantity, id } = req.body;
      console.log('this is userId from updateFood', userId);
      console.log('this is body update foor', req.body)
      const Today = new Date();
        const dateFormat = Today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const startOfDay = new Date(dateFormat); // Midnight of the day
        const endOfDay = new Date(dateFormat);
        endOfDay.setDate(endOfDay.getDate() + 1); // Midnight of next day

      let userMeals = await Food.findOne({ user: userId,createdAt: { $gte: startOfDay,$lt: endOfDay}});
      
      if (!userMeals) {
        return res.status(404).json({ message: 'User meal data not found' });
      }

      const findAndRemoveMealItem = (mealArray) => {
        const index = mealArray.findIndex(item => item._id.toString() === id);
        if (index !== -1) {
          const mealItem = mealArray.splice(index, 1)[0]; 
          return mealItem;
        }
        return null;
      };
  
      let mealItem;
  
      mealItem = findAndRemoveMealItem(userMeals.breakfast);
      if (!mealItem) mealItem = findAndRemoveMealItem(userMeals.lunch);
      if (!mealItem) mealItem = findAndRemoveMealItem(userMeals.dinner);
  
      if (!mealItem) {
        return res.status(404).json({ message: 'Meal item not found' });
      }
  
      if (quantity && quantity !== mealItem.quantity) {
        mealItem.quantity = quantity;
      }
  
      if (meal === 'Breakfast') {
        userMeals.breakfast.push(mealItem);
      } else if (meal === 'Lunch') {
        userMeals.lunch.push(mealItem);
      } else if (meal === 'Dinner') {
        userMeals.dinner.push(mealItem);
      } else {
        return res.status(400).json({ message: 'Invalid meal type' });
      }
  
      await userMeals.save();
      return res.status(200).json({ message: 'Meal updated successfully', userMeals });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  const removeFood = async (req, res) => {
    
    try {
      const { userId } = req.user; 
      const { id } = req.body; 
      console.log('this is body from remove Food-->', req.body)
      const Today = new Date();
        const dateFormat = Today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const startOfDay = new Date(dateFormat); // Midnight of the day
        const endOfDay = new Date(dateFormat);
        endOfDay.setDate(endOfDay.getDate() + 1); // Midnight of next day

      let userMeals = await Food.findOne({ user: userId,createdAt: { $gte: startOfDay,$lt: endOfDay}}); 

      if (!userMeals) {
        return res.status(404).json({ message: 'User meal data not found' });
      }  
      const findAndRemoveMealItem = (mealArray) => {
        const index = mealArray.findIndex(item => item._id.toString() === id);
        if (index !== -1) {
          const mealItem = mealArray.splice(index, 1)[0]; 
          return mealItem;
        }
        return null;
      };  
      let mealItem;
       mealItem = findAndRemoveMealItem(userMeals.breakfast) ||
                 findAndRemoveMealItem(userMeals.lunch) ||
                 findAndRemoveMealItem(userMeals.dinner);
  
      if (!mealItem) {
        return res.status(404).json({ message: 'Meal item not found' });
      }      
      await userMeals.save();
  
      return res.status(200).json({ message: 'Meal updated successfully', userMeals });
    } catch (error) {
      console.error('Error in removeFood controller:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  

  export {
    getFoodById,
    postFood,
    updateFood,
    removeFood
  }