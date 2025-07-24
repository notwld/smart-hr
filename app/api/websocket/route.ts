import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Global variable to store the Socket.IO server instance
let io: SocketIOServer | null = null;

// Initialize Socket.IO server
function getIO() {
  if (!io) {
    io = new SocketIOServer(3001, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    setupSocketHandlers(io);
  }
  return io;
}

function setupSocketHandlers(io: SocketIOServer) {
  const userSockets = new Map(); // userId -> socketId
  const onlineUsers = new Set();

  io.on('connection', async (socket) => {
    console.log('User connected:', socket.id);

    // Authenticate user
    socket.on('authenticate', async (token: string) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: token },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            pfp: true
          }
        });

        if (user) {
          socket.data.userId = user.id;
          userSockets.set(user.id, socket.id);
          onlineUsers.add(user.id);
          
          // Update user's online status
          await updateUserPresence(user.id, true);
          
          // Join user's chat rooms
          await joinUserRooms(socket, user.id);
          
          // Broadcast user online status
          broadcastUserPresence(io, user.id, true);
          
          socket.emit('authenticated', { userId: user.id });
          console.log('User authenticated:', user.id);
        } else {
          socket.emit('authentication_error', 'Invalid token');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('authentication_error', 'Authentication failed');
      }
    });

    // Join chat room
    socket.on('join_room', async (roomId: string) => {
      const userId = socket.data.userId;
      if (userId) {
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);
        
        // Mark messages as read
        await markMessagesAsRead(roomId, userId);
      }
    });

    // Leave chat room
    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
      console.log(`User left room ${roomId}`);
    });

    // Send message
    socket.on('send_message', async (data: {
      roomId: string;
      content: string;
      messageType: 'TEXT' | 'FILE' | 'IMAGE' | 'AUDIO' | 'VIDEO';
      parentMessageId?: string;
      forwardedFrom?: string;
    }) => {
      const userId = socket.data.userId;
      if (!userId) return;

      try {
        const message = await saveMessage({
          ...data,
          senderId: userId
        });

        // Broadcast message to room
        io.to(data.roomId).emit('new_message', message);
        
        // Update last read for sender
        await updateLastRead(data.roomId, userId);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', 'Failed to send message');
      }
    });

    // Edit message
    socket.on('edit_message', async (data: {
      messageId: string;
      content: string;
    }) => {
      const userId = socket.data.userId;
      if (!userId) return;

      try {
        const message = await editMessage(data.messageId, data.content, userId);
        if (message) {
          io.to(message.roomId).emit('message_edited', message);
        }
      } catch (error) {
        console.error('Error editing message:', error);
        socket.emit('message_error', 'Failed to edit message');
      }
    });

    // Delete message
    socket.on('delete_message', async (messageId: string) => {
      const userId = socket.data.userId;
      if (!userId) return;

      try {
        const message = await deleteMessage(messageId, userId);
        if (message) {
          io.to(message.roomId).emit('message_deleted', {
            messageId,
            roomId: message.roomId
          });
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        socket.emit('message_error', 'Failed to delete message');
      }
    });

    // Typing indicator
    socket.on('typing_start', (roomId: string) => {
      const userId = socket.data.userId;
      if (userId) {
        socket.to(roomId).emit('user_typing', { userId, roomId });
      }
    });

    socket.on('typing_stop', (roomId: string) => {
      const userId = socket.data.userId;
      if (userId) {
        socket.to(roomId).emit('user_stopped_typing', { userId, roomId });
      }
    });

    // File upload
    socket.on('upload_file', async (data: {
      roomId: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      content: string;
    }) => {
      const userId = socket.data.userId;
      if (!userId) return;

      try {
        const fileUrl = await saveFile(data.fileName, data.content);
        const message = await saveMessage({
          roomId: data.roomId,
          senderId: userId,
          content: `Shared file: ${data.fileName}`,
          messageType: getFileType(data.mimeType),
          fileUrl,
          fileName: data.fileName,
          fileSize: data.fileSize,
          mimeType: data.mimeType
        });

        io.to(data.roomId).emit('new_message', message);
      } catch (error) {
        console.error('Error uploading file:', error);
        socket.emit('message_error', 'Failed to upload file');
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      const userId = socket.data.userId;
      if (userId) {
        userSockets.delete(userId);
        onlineUsers.delete(userId);
        
        // Update user's offline status
        await updateUserPresence(userId, false);
        
        // Broadcast user offline status
        broadcastUserPresence(io, userId, false);
      }
      console.log('User disconnected:', socket.id);
    });
  });
}

async function joinUserRooms(socket: any, userId: string) {
  try {
    const userRooms = await prisma.chatParticipant.findMany({
      where: { userId },
      include: { room: true }
    });

    userRooms.forEach(participant => {
      socket.join(participant.roomId);
    });
  } catch (error) {
    console.error('Error joining user rooms:', error);
  }
}

async function saveMessage(data: {
  roomId: string;
  senderId: string;
  content: string;
  messageType: 'TEXT' | 'FILE' | 'IMAGE' | 'AUDIO' | 'VIDEO';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  parentMessageId?: string;
  forwardedFrom?: string;
}) {
  const message = await prisma.chatMessage.create({
    data: {
      roomId: data.roomId,
      senderId: data.senderId,
      content: data.content,
      messageType: data.messageType,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      parentMessageId: data.parentMessageId,
      forwardedFrom: data.forwardedFrom
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          pfp: true
        }
      }
    }
  });

  return message;
}

async function editMessage(messageId: string, content: string, userId: string) {
  const message = await prisma.chatMessage.findFirst({
    where: { id: messageId, senderId: userId }
  });

  if (!message) {
    throw new Error('Message not found or not authorized');
  }

  return await prisma.chatMessage.update({
    where: { id: messageId },
    data: { content, isEdited: true },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          pfp: true
        }
      }
    }
  });
}

async function deleteMessage(messageId: string, userId: string) {
  const message = await prisma.chatMessage.findFirst({
    where: { id: messageId, senderId: userId }
  });

  if (!message) {
    throw new Error('Message not found or not authorized');
  }

  return await prisma.chatMessage.update({
    where: { id: messageId },
    data: { isDeleted: true }
  });
}

async function saveFile(fileName: string, content: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'chat');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileId = uuidv4();
  const fileExt = path.extname(fileName);
  const newFileName = `${fileId}${fileExt}`;
  const filePath = path.join(uploadsDir, newFileName);

  // Save file
  const buffer = Buffer.from(content, 'base64');
  fs.writeFileSync(filePath, buffer);

  return `/uploads/chat/${newFileName}`;
}

function getFileType(mimeType: string): 'FILE' | 'IMAGE' | 'AUDIO' | 'VIDEO' {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  return 'FILE';
}

async function markMessagesAsRead(roomId: string, userId: string) {
  const unreadMessages = await prisma.chatMessage.findMany({
    where: {
      roomId,
      senderId: { not: userId },
      readStatus: {
        none: {
          userId
        }
      }
    }
  });

  const readStatuses = unreadMessages.map(message => ({
    messageId: message.id,
    userId
  }));

  if (readStatuses.length > 0) {
    await prisma.messageReadStatus.createMany({
      data: readStatuses,
      skipDuplicates: true
    });
  }
}

async function updateLastRead(roomId: string, userId: string) {
  await prisma.chatParticipant.updateMany({
    where: { roomId, userId },
    data: { lastReadAt: new Date() }
  });
}

async function updateUserPresence(userId: string, isOnline: boolean) {
  await prisma.userLastSeen.upsert({
    where: { userId },
    update: {
      lastSeen: new Date(),
      isOnline
    },
    create: {
      userId,
      lastSeen: new Date(),
      isOnline
    }
  });
}

function broadcastUserPresence(io: SocketIOServer, userId: string, isOnline: boolean) {
  io.emit('user_presence', {
    userId,
    isOnline,
    lastSeen: new Date()
  });
}

// API route handler
export async function GET(req: NextRequest) {
  // Initialize the WebSocket server
  getIO();
  
  return new Response('WebSocket server is running', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
} 