import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authMiddleware } from "./middleware/authMiddleware";

import http from "http";
import { Server, Socket } from "socket.io";
import jwksClient from "jwks-rsa";
import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from "jsonwebtoken";
declare module "socket.io" {
  interface Socket {
    user: { sub: string };
  }
}
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();



/* ROUTE IMPORT */
import tenantRoutes from "./routes/tenantRoutes";
import managerRoutes from "./routes/managerRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import leaseRoutes from "./routes/leaseRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import conversationRoutes from "./routes/conversationRoutes"

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.get("/", (req, res) => {
  res.send("This is home route");
});

app.use("/applications", applicationRoutes);
app.use("/properties", propertyRoutes);
app.use("/leases", leaseRoutes);
app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);
app.use("/conversation", authMiddleware(["manager", "tenant"]), conversationRoutes);



/* SOCKET.IO SERVER */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // or your frontend domain
    methods: ["GET", "POST"]
  }
});

/* Verify Cognito JWT */
const jwks = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.AWS_COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
});

const getKey = (header: JwtHeader, callback: SigningKeyCallback) => {
  jwks.getSigningKey(header.kid!, (err, key) => {
    if (err || !key) {
      return callback(new Error("Signing key not found"), Buffer.alloc(0));
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

// Middleware to verify JWT and attach user info
io.use((socket: Socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Token missing"));

  jwt.verify(token, getKey, {}, (err, decoded) => {
    if (err || !decoded) return next(new Error("Unauthorized"));

    if (decoded && typeof decoded !== 'string' && 'sub' in decoded && decoded.sub) {
      socket.user = { sub: decoded.sub }; // safely assign the sub field
      next();
    } else {
      return next(new Error("Invalid token: sub not found"));
    }
  });
});

// Socket event listeners
io.on("connection", (socket: Socket) => {
  const userId = socket.user?.sub; // Safely access user.sub
  if (!userId) {
    console.error("User ID not found");
    return;
  }

  console.log(`User connected: ${userId}`);

  socket.on("joinRoom", async ({ conversationId }) => {
    socket.join(conversationId);
  
    try {
      const messages = await prisma.messages.findMany({
        where: { conversationid: conversationId },
        orderBy: { createdat: "asc" },
      });
  
      socket.emit("messageHistory", messages);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  });

  socket.on("sendMessage", async ({ conversationId, content }) => {
    const createdAt = new Date().toISOString();
    try {
      const newMessage = await prisma.messages.create({
        data: {
          conversationid : conversationId,
          senderid: userId, // from socket.user.sub
          content,
          createdat: new Date(createdAt),
        },
      });

      io.to(conversationId).emit("receiveMessage", newMessage);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });


  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId}`);
  });
});

const port = Number(process.env.PORT) || 3001;

server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
}); 

/* SERVER */





