import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { startConversation, getUserConversations, getConversationMessages } from "../controllers/conversationController";

const router = express.Router();

// 🔹 Start a new conversation (tenant <-> manager for a property)
router.post("/start", authMiddleware(["manager", "tenant"]), startConversation);

// 🔹 Get all conversations for a user (tenant or manager)
router.get("/:userId", authMiddleware(["manager", "tenant"]), getUserConversations);

// 🔹 Get all messages for a conversation
router.get("/messages/:conversationId", authMiddleware(["manager", "tenant"]), getConversationMessages);

export default router;





