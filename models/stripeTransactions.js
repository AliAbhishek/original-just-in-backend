import { Schema, model } from "mongoose";

const stripeTransactionSchema = new Schema(
  {
    transaction_id: String,
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
   
    payment_intent: String,
    refund_id: String,
    amount: Number,
    // 0 for paid by user 1 for withdrawal
    transaction_type: { type: Number, default: 0 },
    // 0 for Not refunded 1 for refunded
    refunded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const StripeTransaction = model(
  "StripeTransaction",
  stripeTransactionSchema,
  "stripetransactions"
);

export default StripeTransaction;
