import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import 'dotenv/config';
import { errorRes } from '../utils/response.js';

const authentication = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      throw new Error('Authorization header is missing');
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;
    const user = await User.findById(userId);
    req.user = user;
    await user.save();
     if(user?.is_admin_deleted == 1){
      return errorRes(res, 403, "Your Account has been Deleted By Admin", user);
     }
     if(user?.is_deleted == 1){
      return errorRes(res, 403, "User Not Found");
     }
     if(user?.is_active == 0){
      return errorRes(res, 403, "Admin has suspended Your Account", user);
     }
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({
      status_code:401,
      error: 'Token verification failed',
    });
  }
};

export default authentication;