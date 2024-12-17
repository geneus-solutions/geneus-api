import Voucher from "../models/Voucher.js";

const redeemVoucher =  async (req, res) => {
    try {
      const voucher = await Voucher.findById(req.params.id).populate("coupon_id");
  
      if (!voucher) return res.status(404).json({ error: "Voucher not found" });
      if (voucher.status === "redeemed") return res.status(400).json({ error: "Voucher already redeemed" });
  
        //   check if the coupon is expired
        if (voucher.coupon_id.expires_at < new Date()) return res.status(400).json({ error: "Coupon expired" });

      voucher.status = "redeemed";
      await voucher.save();
  
      res.status(200).json({ message: "Voucher redeemed successfully", voucher });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}

// Get vouchers by user ID

const getVouchersByUserId = async (req, res) => {
    try {
      const vouchers = await Voucher.find({ user_id: req.params.userId }).populate("coupon_id");
      res.status(200).json(vouchers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

export { redeemVoucher,getVouchersByUserId };   

