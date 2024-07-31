import * as Model from "../../models/index.js";
import { errorRes, successRes } from "../../utils/response.js";
const createSupport = async (req, res) => {
    try {
      const isSupport = await Model.Support.findOne({
        user_id: req.user._id,
        status: 0,
      });
  
      if (isSupport) return successRes(res, 200, "Support", isSupport);
      const support = await Model.Support.create({
        user_id: req.user._id,
      });
      return successRes(res, 200, "Support", support);
    } catch (error) {
      return errorRes(res, 500, error);
    }
  };
  
  const getSupportChat = async (req, res) => {
    try {
      const support = await Model.Support.findOne({ user_id: req.user._id, status: 0 });
      if(!support){
        return successRes(res, 200, "Support chat",[]);
      }
      const supportChat = await Model.SupportChat.find({ support_id:support._id });
      return successRes(res, 200, "Support chat", supportChat);
    } catch (error) {
      return errorRes(res, 500, error.message);
    }
  };
  
  const saveSupportMessage = async (supportObj) => {
    try {
    const { support_id, message, sender_type, sender_id } = supportObj;
    const supportMongooseObj = await Model.SupportChat.create({
    support_id,
    message,
    sender_id,
    docModel: sender_type == 0 ? "Admin" : "User",
    sender_type,
    });
    const updateSupport = await Model.Support.findOneAndUpdate(
      {_id: support_id},
      {$set:{message: message}},
      {new: true}
    )
    return supportMongooseObj;
    } catch (error) {
    console.log(error)
    }
    };

  export {createSupport,getSupportChat,saveSupportMessage}