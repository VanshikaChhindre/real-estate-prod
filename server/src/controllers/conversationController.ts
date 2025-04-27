import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userInfo } from "os";

const prisma = new PrismaClient();


// ✅ Create or Get Conversation (Between Tenant & Manager for a Property)
export const startConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tenantId, managerId } = req.body;

    if (!tenantId || !managerId) {
      res.status(400).json({ message: "tenantId, managerId, and propertyId are required." });
      return;
    }

    // 🔹 Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { tenantid: tenantId },
          { managerid: managerId },
   
        ],
      },
    });

    if (existingConversation) {
      res.status(200).json(existingConversation);
      return;
    }

    // 🔹 Create a new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        tenantid: tenantId,
        managerid: managerId
      },
    });

    res.status(201).json(newConversation);
  } catch (error: any) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ message: `Error starting conversation: ${error.message}` });
  }
};

// ✅ Get All Conversations for a User (Tenant OR Manager)
export const getUserConversations = async (req: Request, res: Response): Promise<void> => {
  
  const userId = req.params.userId;
  if (!userId) {
    res.status(400).json({ message: "User ID is required." });
    return;
  }

  try {

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ tenantid: userId }, { managerid: userId }],
      },
      include: {
        messages: {
          orderBy: { createdat: "desc" }, // Get latest message first
          take: 1, // Only fetch last message for preview
        },
      },
    });
    if(!conversations){
      console.log("couldn't Find conversations!")
    }

    res.status(200).json(conversations);
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: `Error fetching conversations: ${error.message}` });
  }
};

// ✅ Get Messages for a Conversation
export const getConversationMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      res.status(400).json({ message: "Conversation ID is required." });
      return;
    }

    const messages = await prisma.messages.findMany({
      where: { conversationid: conversationId},
      orderBy: { createdat: "asc" },
    });

    res.status(200).json(messages);
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: `Error fetching messages: ${error.message}` });
  }
};
