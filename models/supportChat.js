
import { Schema, model } from "mongoose";

const supportChatSchema = new Schema(
{
support_id: { type: Schema.Types.ObjectId, ref: "Support" },
sender_id: { type: Schema.Types.ObjectId, refPath: "docModel" },
docModel: {
type: String,
required: true,
default: "Admin",
enum: ["User", "Admin"],
},
// sender 0 for Admin 1 for User
sender_type: { type: Number, default: 0 },
message: String,
},
{ timestamps: true }
);

const SupportChat = model(
"SupportChat",
supportChatSchema,
"supportchats"
);
export default SupportChat;
