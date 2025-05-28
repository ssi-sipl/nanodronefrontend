import { io } from "socket.io-client";
import { baseUrl } from "./config";

const socket = io(baseUrl); // Your backend URL

export default socket;
