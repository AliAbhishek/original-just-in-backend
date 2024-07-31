import jwt from 'jsonwebtoken';
import * as Model from "../models/index.js";
import 'dotenv/config';
import {saveSupportMessage} from "../controllers/user/supportTab.js";

export default function (io) {
  io.on("connection", async(socket) => {

    socket.on("send_support", async (supportObj) => {
      supportObj.time = new Date();

      const supportmsg = await saveSupportMessage(supportObj);
      const support_id = supportObj?.support_id;

      await io.emit(support_id, supportmsg);
    });


    socket.on("disconnect", async() => {
      if(user){
        user.is_online = 0;
        await user.save();
      }
      console.log("disconnected", socket.id);
    });
  });
}; 
