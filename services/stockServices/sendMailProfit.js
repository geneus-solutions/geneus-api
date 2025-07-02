import User from "../../models/User.js";
import eventBus from "../../utilities/createEvent.js";
import sendEmail from  "../../controllers/EmailController.js";
import StockTargetEmail from "../../models/StockTargetEmail.js";

eventBus.on("sendTargetProfitMail", async ({ userId, stockName, profitPercentage, targetPercentage, totalShares, totalInvestment }) => {
  try {
    const user = await User.findById({_id: userId});
    if (!user?.email) return;
    await sendEmail(
            process.env.email,
            process.env.toAdmin,
            `🎯 Target Reached for ${stockName}`,
            `Hi ${user.name},Your stock ${stockName} has reached a profit of ${profitPercentage.toFixed(2)}%, exceeding your target of ${targetPercentage}%!You might want to review your investment now. - Stock Tracker,
            Total Shares ${totalShares} your invested Amount is ${totalInvestment}`,);

    console.log(`Mail sent to ${user.email} for ${stockName}`);
    const emailSent = await StockTargetEmail.findOneAndUpdate({userId, stockName},
      {
        emailSent: true,
      },
      {
        new: true,
      runValidators: true,
      }
    )
    if(!emailSent){
      const createNew = await StockTargetEmail.create({
        userId,
        stockName,
        emailSent: true
      })
    }
  } catch (error) {
    console.error("Failed to send mail:", error);
  }
});
