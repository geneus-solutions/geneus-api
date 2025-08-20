import Food from '../models/Food.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { configDotenv } from 'dotenv';

configDotenv()
const postFood =  async (req, res) => {
  
  try {
        const { userId } = req.user; // Extract userId from the request
        console.log('this is userId', userId);
        const { breakfast, lunch, dinner } = req.body;
        const userExists = await User.findById(userId);

        if (!userExists) {
          return res.status(404).json({ message: "User not found" });
        }

        const currentDate = new Date();
        const dateFormat = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

        const startOfDay = new Date(dateFormat); // Midnight of the day
        const endOfDay = new Date(dateFormat);
        endOfDay.setDate(endOfDay.getDate() + 1); // Midnight of next day

        let foodData = await Food.findOne({ user:userId,createdAt: { $gte: startOfDay,$lt: endOfDay}});

        // console.log("foodData post : ", foodData)

        const formatItems = (mealItems) => {
          if (!mealItems) return [];
          if (Array.isArray(mealItems)) {
              return mealItems.map(item => ({ item, quantity: 1 }));
          }
          return [{ item: mealItems, quantity: 1 }];
        };

        if (foodData) {
            if (breakfast) {
                const formattedBreakfast = formatItems(breakfast);
                formattedBreakfast.forEach(newItem => {
                    const existingItem = foodData.breakfast.find(item => item.item.toString() === newItem.item);
                    if (existingItem) {
                        existingItem.quantity += newItem.quantity;
                    } else {
                        foodData.breakfast.push(newItem);
                    }
                });
            }

            if (lunch) {

              const formattedLunch = formatItems(lunch);

              formattedLunch.forEach(newItem => {
                const existingItem = foodData.lunch.find(item => item.item.toString() === newItem.item);
                if (existingItem) {
                    existingItem.quantity += newItem.quantity;
                } else {
                    foodData.lunch.push(newItem);
                }
              });
              
            }

            if (dinner) {
                const formattedDinner = formatItems(dinner);
                formattedDinner.forEach(newItem => {
                    const existingItem = foodData.dinner.find(item => item.item.toString() === newItem.item);
                    if (existingItem) {
                        existingItem.quantity += newItem.quantity;
                    } else {
                        foodData.dinner.push(newItem);
                    }
                });
            }

            const updatedFood = await foodData.save();
            console.log('this is updated Food', updatedFood);

            return res.status(200).json(updatedFood);

        } else {
            const newFood = new Food({
                user:userId,
                breakfast: formatItems(breakfast),
                lunch: formatItems(lunch),
                dinner: formatItems(dinner)
            });

            await newFood.save();
            return res.status(201).json(newFood);
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
 
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
            .populate('dinner.item');    

            console.log('this  is foodData', foodData)
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

          ...foodData._doc, 
          totalCalories,
          totalProtein : Math.round(totalProtein),
          totalCarbs : Math.round(totalCarbs),
          totalFat : Math.round(totalFat)

        };
        console.log('thtis is response Data', responseData)
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