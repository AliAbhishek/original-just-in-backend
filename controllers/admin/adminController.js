import * as Model from "../../models/index.js";
import { successRes, errorRes } from "../../utils/response.js";
import "dotenv/config";
const dashboard = async (req, res) => {
  try {
    const totalUsers = await Model.User.countDocuments({});
    const activeUser = await Model.User.countDocuments({
      is_active: 1,
    });
    const activeUserPerctage = Math.round((activeUser*100)/totalUsers);
    const inActiveUser = totalUsers - activeUser;
    const inActiveUserPercentage = Math.round((inActiveUser*100)/totalUsers);
    const totalOrders = await Model.Order.countDocuments({});
    const completedOrder = await Model.Order.countDocuments({
      order_status: 4,
    });
    const completedOrderPercentage = Math.round((completedOrder*100)/totalOrders);
    const activeOrder = await Model.Order.countDocuments({
      order_status: { $in: [0, 1, 2, 3] },
    });
    const cancelOrder = await Model.Order.countDocuments({order_status: 5});
    const cancelOrderPercentage = Math.round((cancelOrder*100)/totalOrders);
    const activeOrderPercentage = Math.round((activeOrder*100)/totalOrders);
    const response = {
      totalUsers,
      activeUser,
      inActiveUser,
      totalOrders,
      completedOrder,
      activeOrder,
      activeUserPerctage,
      inActiveUserPercentage,
      completedOrderPercentage,
      activeOrderPercentage,
      cancelOrder,
      cancelOrderPercentage
    };
    return successRes(res, 200, "Dashboard Data", response)
  } catch (err) {
    console.error(err);
    return errorRes(res, 500, err.message);
  }
};
const userManagement = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const searchName = req.query.name;
    const type = parseInt(req.query.type);

    let query = {};
    // query.is_admin_deleted = 0;
    query.email_verified = 1;
    if (type === 1 || type === 0) {
      query.is_active = type;
    }

    if (searchName) {
      query.full_name = { $regex: searchName, $options: "i" };
    }

    const totalCount = await Model.User.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    const users = await Model.User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const response = {
      currentPage: page,
      totalPages: totalPages,
      totalCount: totalCount,
      users: users,
    };
    return successRes(res, 200, "User Management Data", response);
  } catch (err) {
    console.error(err);
    return errorRes(res, 500, err.message);
  }
};
const userProfile = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return errorRes(res, 400, "UserId is Required");
    }
    const userData = await Model.User.findOne({ _id: userId });
    if (!userData) {
      return errorRes(res, 404, "User not Found");
    }
    return successRes(res, 200, "User Profile", userData);
  } catch (err) {
    console.error(err);
    return errorRes(res, 500, err.message);
  }
};
const banUnbanUser = async (req, res) => {
  try {
    const { userId, type } = req.body;
    const userData = await Model.User.findOneAndUpdate(
      { _id: userId },
      { $set: { is_active: type } },
      { new: true }
    );
    if (!userData) {
      return errorRes(res, 404, "User Not Found");
    }
    let message =
      type == 0 ? "User Banned Successfully" : "User Unbanned Successfully";
    return successRes(res, 200, message, userData);
  } catch (err) {
    console.error(err);
    return errorRes(res, 500, err.message);
  }
};
const deleteAccount = async (req, res) => {
  try {
    const { userId } = req.query;
    const delUser = await Model.User.findOneAndDelete({ _id: userId });
    if (!delUser) {
      return errorRes(res, 404, "User Not Found");
    }
    await Model.Address.deleteMany({ userId: userId });
    await Model.Cart.deleteMany({ userId: userId });
    await Model.Order.deleteMany({ userId: userId });
    await Model.StripeTransaction.deleteMany({ user_id: userId });
    await Model.SupportChat.deleteMany({ sender_id: userId });
    return successRes(res, 200, "User Deleted Successfully", delUser);
  } catch (err) {
    console.error(err);
    return errorRes(res, 500, err.message);
  }
};
const addProduct = async (req, res) => {
  try {
    const adminId = req.user._id;
    if (req.files && req.files.image) {
      req.body.image = `public/${req.files.image[0].filename}`;
    }
    const newProduct = await Model.Product.create({
      adminId: adminId,
      ...req.body,
    });
    return successRes(res, 200, "Product Added Successfully", newProduct);
  } catch (error) {
    return errorRes(res, 500, error.message);
  }
};
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return errorRes(res, 400, "Please provide product Id");
    }
    const productData = await Model.Product.findOneAndUpdate(
      { _id: productId },
      { $set: { is_deleted: 1 } },
      { new: true }
    );
    if (!productData) {
      return errorRes(res, 404, "Product not found");
    }
    return successRes(res, 200, "Product Deleted Successfully", productData);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const getProductById = async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) {
      return errorRes(res, 400, "Please provide product Id");
    }
    const productData = await Model.Product.findOne({ _id: productId });
    if (!productData) {
      return errorRes(res, 404, "Product Not Found");
    }
    return successRes(res, 200, "Product Found Succesfully", productData);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};

const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || null;
    const searchName = req.query.name;
    let query = {};
    query.is_deleted = 0;
    if (searchName) {
      query.product_name = { $regex: searchName, $options: "i" };
    }

    const totalCount = await Model.Product.countDocuments(query);
    let totalPages = 1;
    let allProducts;

    // Apply pagination only if both page and limit are provided and valid
    if (limit) {
      totalPages = Math.ceil(totalCount / limit);
      allProducts = await Model.Product.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
    } else {
      // If no pagination is specified, fetch all cities
      allProducts = await Model.Product.find(query).sort({ createdAt: -1 });
    }

    const response = {
      currentPage: page || 1,
      totalPages: totalPages,
      totalCount: totalCount,
      allProducts: allProducts,
    };
    return successRes(res, 200, "Products Data", response);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const editProduct = async (req, res) => {
  try {
    if (req.files && req.files.image) {
      req.body.image = `public/${req.files.image[0].filename}`;
    }
    const updateProduct = await Model.Product.findOneAndUpdate(
      { _id: req.body.productId },
      { $set: { ...req.body } },
      { new: true }
    );
    if (!updateProduct) {
      return errorRes(res, 404, "Product not found");
    }
    return successRes(res, 200, "Product Updated Successfully", updateProduct);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || null;
    const searchName = req.query.name;
    const status = parseInt(req.query.status);
    let query = {};
    let userQuery = {};
    if (searchName) {
      userQuery.full_name = { $regex: searchName, $options: "i" };
    }
    let matchingUsers = await Model.User.find(userQuery).select("_id");
    let matchingUserIds = matchingUsers.map((user) => user._id);
    // Construct the order query
    if (matchingUserIds.length > 0) {
      query.userId = { $in: matchingUserIds };
    } else if (searchName) {
      return res.status(200).json({
        status: 200,
        message: "Details of orders",
        data: {
          currentPage: page,
          totalPages: 0,
          totalCount: 0,
          data: [],
        },
      });
    }
    if (status || status === 0) {
      query.order_status = status;
    }

    const totalCount = await Model.Order.countDocuments(query);
    let totalPages = 1;
    let allOrders;
    const testQuery = await Model.Order.find(query).limit(5);
    console.log("Test Query Results:", testQuery);

    // Apply pagination only if both page and limit are provided and valid
    if (limit) {
      totalPages = Math.ceil(totalCount / limit);
      allOrders = await Model.Order.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("userId productId addressId");
    } else {
      // If no pagination is specified, fetch all cities
      allOrders = await Model.Order.find(query)
        .sort({ createdAt: -1 })
        .populate("userId productId addressId");
    }

    const response = {
      currentPage: page || 1,
      totalPages: totalPages,
      totalCount: totalCount,
      allOrders: allOrders,
    };
    return successRes(res, 200, "Order list", response);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId) {
      return errorRes(res, 404, "Order Id is Required");
    }
    const orderData = await Model.Order.findOne({ _id: orderId })
      .populate({
        path: "userId",
        select: "full_name profile_image",
      })
      .populate({
        path: "productId",
      })
      .populate({
        path: "addressId",
      });
    return successRes(res, 200, "Order Details", orderData);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const changeOrderStatus = async (req, res) => {
  try {
    const { orderId, status, tracking_id } = req.body;
    let message, orderData;
    const statusUpdate = {
      status: parseInt(status),
      updatedAt: new Date(),
    };
    const order = await Model.Order.findById(orderId);
    if (order?.order_status == 5) {
      return errorRes(
        res,
        400,
        "You can't change the status of canceled orders."
      );
    }

    if (status) {
      if (status == 5 && order?.order_status == 4) {
        return errorRes(res, 400, "You can't canceled the delivered order");
      }
      const statusSequence = [0, 1, 2, 3, 4, 5];
      const currentStatusIndex = statusSequence.indexOf(order.order_status);
      const newStatusIndex = statusSequence.indexOf(parseInt(status));

      if (
        (newStatusIndex <= currentStatusIndex && newStatusIndex !== 5) ||
        (newStatusIndex > currentStatusIndex + 1 && newStatusIndex !== 5)
      ) {
        return errorRes(
          res,
          400,
          "Please follow the correct status progression."
        );
      }
    }

    const existingStatus = order.order_statuses.find(
      (item) => item.status === status
    );
    if (!existingStatus) {
      orderData = await Model.Order.findOneAndUpdate(
        { _id: orderId },
        {
          $set: {
            order_status: status,
            tracking_id: tracking_id,
          },
          $addToSet: {
            order_statuses: statusUpdate,
          },
        },
        { new: true }
      );
    } else {
      orderData = await Model.Order.findOneAndUpdate(
        { _id: orderId },
        {
          $set: {
            tracking_id: tracking_id,
          },
        },
        { new: true }
      );
    }

    if (!orderData) {
      return errorRes(res, 404, "Order Data Not found");
    }

    switch (parseInt(status)) {
      case 1:
        message = "Order Placed Successfully";
        break;
      case 2:
        message = "Order Shipped Successfully";
        break;
      case 3:
        message = "Order Out For Delivery Successfully";
        break;
      case 4:
        message = "Order Delivered Successfully";
        break;
      case 5:
        message = "Order Canceled Successfully";
        break;
      default:
        message = "Tracking Id Added Successfully";
    }
    console.log(message, "message");
    return successRes(res, 200, message, orderData);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const getActivities = async (req, res) => {
  try {
    const activities = await Model.Activity.find({
      user_id: req.query.user_id,
    }).sort({ createdAt: -1 });

    return successRes(res, 200, "activities", activities);
  } catch (error) {
    return errorRes(res, 500, error.message);
  }
};
export {
  addProduct,
  getProducts,
  getProductById,
  deleteProduct,
  editProduct,
  userManagement,
  userProfile,
  banUnbanUser,
  deleteAccount,
  getOrders,
  getOrderById,
  changeOrderStatus,
  dashboard,
  getActivities,
};
