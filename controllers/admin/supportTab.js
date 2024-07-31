import * as Model from "../../models/index.js";
import { errorRes, successRes } from "../../utils/response.js";

const getSupports = async (req, res) => {
  try {
    let query = {};
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    

    const { status, search } = req.query;

    if (status) {
      query.status = status;
    }

    // If search parameter is provided, construct the user search query
    const userSearchQuery = search
      ? {
          full_name: {
            $regex: search,
            $options: "i",
          },
        }
      : {};

    // Find users matching the full_name search query
    const users = await Model.User.find(userSearchQuery);

    // Get user IDs
    const userIds = users.map((user) => user._id);

    // Construct search query for Support collection
    query.user_id = { $in: userIds };
    const totalCount = await Model.Support.countDocuments(query);
    // Execute the query to get supports with pagination
    const supports = await Model.Support.find(query)
      .populate("user_id")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    // Send the response
    return successRes(res, 200, "Supports list", {
      supports,
      totalPages,
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    // Handle errors
    return errorRes(res, 500, error.message);
  }
};

const getSupportChat = async (req, res) => {
  try {
    const support = await Model.Support.findById(req.query.id).populate("user_id");

    const supportChat = await Model.SupportChat.find({ support_id: req.query.id }).populate("sender_id");

    const responseObj = {
      userdetails: {
        username: support?.user_id?.full_name,
        userimage: support?.user_id?.profile_image || null,
      },
      chats: supportChat,
    };

    return successRes(res, 200, "Support Chat", responseObj);
  } catch (error) {
    return errorRes(res, 500, error.message);
  }
};

const changeSupportStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const support = await Model.Support.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("user_id");
    return successRes(res, 200, "Support status changed successfully", support);
  } catch (error) {
    return errorRes(res, 500, error.message);
  }
};

export {
  getSupports,
  changeSupportStatus,
  getSupportChat,
};
