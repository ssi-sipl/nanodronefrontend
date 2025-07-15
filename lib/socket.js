import { io } from "socket.io-client";
import { baseUrl } from "./config.js";

const socket = io(baseUrl); // Your backend URL

export default socket;
