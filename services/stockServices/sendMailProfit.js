import User from "../../models/User.js";
import eventBus from "../../utilities/createEvent.js";
import sendEmail from "../../controllers/EmailController.js";

eventBus.on("sendTargetProfitMail", async ({ userId, stockSummary }) => {
  try {
    const user = await User.findById({ _id: userId });
    if (!user?.email) return;

    // Build the stock summary as bullet points
    const stockDetails = stockSummary
      .map(
        (stock, index) => 
`${index + 1}. ${stock.stockName}
   - 📈 Profit: ${stock.profitPercentage.toFixed(2)}%
   - 📊 Shares: ${stock.totalShares}
   - 💰 Invested: ₹${stock.totalInvested.toFixed(2)}\n`
      )
      .join("\n");

    const message = `
Hi ${user.name},

🎯 Great news! Some of your stocks have crossed your target profit percentage.

Here’s a quick summary:\n
${stockDetails}

You might want to review your investments and take action based on your financial goals.

Thanks for using Stock Tracker!
Best regards,  
Geneus Solutions – Stock Tracker Team
`;

    // Send email
    await sendEmail(
      process.env.toAdmin,
      user.email,
      `🎯 Profit Target Achieved for Your Stocks`,
      message
    );

    // console.log(`✅ Mail sent to ${user.email}`);
  } catch (error) {
    console.error("❌ Failed to send mail:", error);
  }
});



