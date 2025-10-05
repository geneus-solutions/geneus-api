import Plan from "../models/Plan.js";

const isNutriPlanValid = async(req, res, next) => {
    try {

        const { userId } = req.user;
        console.log('thi is userId form is isNutriPlanVliad', userId)
        const plan = await Plan.findOne({userId});

        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }

        const currentDate = new Date();
        const endDate = new Date(plan.endDate);

        if (currentDate > endDate) {

            return res.status(402).json({ message: "Plan expired" });
        }

        next();
        
    } catch (error) {
        
    }
}

export {isNutriPlanValid};