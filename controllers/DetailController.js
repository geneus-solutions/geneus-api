import User from "../models/User.js";
import Details from "../models/FoodDetails.js";
import { configDotenv } from "dotenv";
import Plan from "../models/Plan.js";
configDotenv();

const getYourCaloriesRequirement = async (req, res) => {
  try {
    const { userId } = req.user;

    const userExists = await User.findById(userId);
    const userPlan = await Plan.findOne({userId: userId})

    if (!userExists) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const detailExists = await Details.findOne({ userId: userId });

    if (!detailExists) {
      res.status(404).json({ message: "Details not found" });
      return;
    }

    let carbs = 0;
    let protein = 0;
    let fat = 0;

    if(detailExists.goal === "Lose Weight"){
      carbs = Math.round((detailExists.caloriegoal * 0.4) / 4);
      protein = Math.round((detailExists.caloriegoal * 0.3) / 4);
      fat = Math.round((detailExists.caloriegoal * 0.3) / 9);
    } else if(detailExists.goal === "Maintain Weight"){
      carbs = Math.round((detailExists.caloriegoal * 0.5) / 4);
      protein = Math.round((detailExists.caloriegoal * 0.25) / 4);
      fat = Math.round((detailExists.caloriegoal * 0.25) / 9);
    } else if(detailExists.goal === "Gain Weight"){
      carbs = Math.round((detailExists.caloriegoal * 0.55) / 4);
      protein = Math.round((detailExists.caloriegoal * 0.2) / 4);
      fat = Math.round((detailExists.caloriegoal * 0.25) / 9);
    } 
     else if(detailExists.goal === "Gain Muscle"){
      carbs = Math.round((detailExists.caloriegoal * 0.4) / 4);
      protein = Math.round((detailExists.caloriegoal * 0.35) / 4);
      fat = Math.round((detailExists.caloriegoal * 0.25) / 9);
    } 
   else if(detailExists.goal === "Athletic Performance"){
      carbs = Math.round((detailExists.caloriegoal * 0.3) / 4);
      protein = Math.round((detailExists.caloriegoal * 0.5) / 4);
      fat = Math.round((detailExists.caloriegoal * 0.2) / 9);
    } 
    else if(detailExists.goal === "Manage Stress"){
      carbs = Math.round((detailExists.caloriegoal * 0.25) / 4);
      protein = Math.round((detailExists.caloriegoal * 0.3) / 4);
      fat = Math.round((detailExists.caloriegoal * 0.45) / 9);
    } 
    console.log(`new Deatails carbs: ${carbs}, protein: ${protein}, fat: ${fat} `)
    res.status(200).json({
      ...detailExists._doc,
      userPlan,
      carbs,
      protein,
      fat,
    });

  } catch (error) {
    console.error("Error fetching details:", error);
    res.status(500).json({ message: error.message });
  }
}

const updateDetail = async (req, res) => {
  try {

    const {userId} = req.user;

    const {
      // userId,
      goal,
      activityLevel,
      gender,
      dateOfBirth,
      country,
      height,
      weight,
      goalWeight,
    } = req.body;
    console.log('this is data', req.body)
    const userExists = await User.findById(userId);

    if (!userExists) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const birthDate = new Date(dateOfBirth);
    const age = new Date().getFullYear() - birthDate.getFullYear();

    let bmi;

    if (gender === "Male" || gender === "male") {
      bmi = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === "Female" || gender === "female") {
      bmi = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      return res
        .status(400)
        .json({ message: 'Invalid gender. Please use "Male" or "Female".' });
    }

    let activityFactor;
    switch (activityLevel) {
      case "sedentary":
        activityFactor = 1.2;
        break;
      case "lightlyActive":
        activityFactor = 1.375;
        break;
      case "moderatelyActive":
        activityFactor = 1.55;
        break;
      case "veryActive":
        activityFactor = 1.725;
        break;
      case "extraActive":
        activityFactor = 1.9;
        break;
      default:
        activityFactor = 1.2;
    }

    const goalMultiplier = {
      "Lose Weight": -500,
      "Maintain Weight": 0,
      "Gain Weight": 500,
    }[goal];

    const tdee = bmi * activityFactor + goalMultiplier;
    const calories = Math.round(tdee);

    const detailExists = await Details.findOne({ userId:userId });

    if (!detailExists) {
      const newDetail = new Details({
        userId:userId,
        goal,
        activityLevel,
        gender,
        dateOfBirth,
        country,
        height,
        weight,
        goal,
        goalWeight,
        caloriegoal: calories,
      });
      await newDetail.save();
    }

    const updatedDetail = await Details.findOneAndUpdate(
      { userId:userId },
      {
        goal,
        activityLevel,
        gender,
        dateOfBirth,
        country,
        height,
        weight,
        caloriegoal: calories,
      },
      { new: true }
    );

    const startDate = new Date();
    const endDate = new Date(startDate);

    endDate.setDate(startDate.getDate() + 3);

    await Plan.create(
      {
        userId,
        startDate,
        endDate,
      }
    );

    res.status(200).json(updatedDetail);

  } catch (error) {
    console.error("Error updating details:", error);
    res.status(500).json({ message: error.message });
  }
};

export {getYourCaloriesRequirement, updateDetail };
