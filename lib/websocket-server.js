const { Server: SocketIOServer } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

class WebSocketServer {
  constructor(server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.userSockets = new Map(); // userId -> socketId
    this.onlineUsers = new Set();

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', async (socket) => {
      console.log('User connected:', socket.id);

      // Authenticate user
      socket.on('authenticate', async (token) => {
        try {
          // Verify user session
          const user = await this.authenticateUser(token);
          if (user) {
            socket.data.userId = user.id;
            this.userSockets.set(user.id, socket.id);
            this.onlineUsers.add(user.id);
            
            // Update user's online status
            await this.updateUserPresence(user.id, true);
            
            // Join user's chat rooms
            await this.joinUserRooms(socket, user.id);
            
            // Broadcast user online status
            this.broadcastUserPresence(user.id, true);
            
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
      socket.on('join_room', async (roomId) => {
        const userId = socket.data.userId;
        if (userId) {
          socket.join(roomId);
          console.log(`User ${userId} joined room ${roomId}`);
          
          // Mark messages as read
          await this.markMessagesAsRead(roomId, userId);
        }
      });

      // Leave chat room
      socket.on('leave_room', (roomId) => {
        socket.leave(roomId);
        console.log(`User left room ${roomId}`);
      });

      // Send message
      socket.on('send_message', async (data) => {
        const userId = socket.data.userId;
        if (!userId) return;

        try {
          const message = await this.saveMessage({
            ...data,
            senderId: userId
          });

          // Broadcast message to room
          this.io.to(data.roomId).emit('new_message', message);
          
          // Update last read for sender
          await this.updateLastRead(data.roomId, userId);
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('message_error', 'Failed to send message');
        }
      });

      // Edit message
      socket.on('edit_message', async (data) => {
        const userId = socket.data.userId;
        if (!userId) return;

        try {
          const message = await this.editMessage(data.messageId, data.content, userId);
          if (message) {
            this.io.to(message.roomId).emit('message_edited', message);
          }
        } catch (error) {
          console.error('Error editing message:', error);
          socket.emit('message_error', 'Failed to edit message');
        }
      });

      // Delete message
      socket.on('delete_message', async (messageId) => {
        const userId = socket.data.userId;
        if (!userId) return;

        try {
          const message = await this.deleteMessage(messageId, userId);
          if (message) {
            this.io.to(message.roomId).emit('message_deleted', {
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
      socket.on('typing_start', (roomId) => {
        const userId = socket.data.userId;
        if (userId) {
          socket.to(roomId).emit('user_typing', { userId, roomId });
        }
      });

      socket.on('typing_stop', (roomId) => {
        const userId = socket.data.userId;
        if (userId) {
          socket.to(roomId).emit('user_stopped_typing', { userId, roomId });
        }
      });

      // File upload
      socket.on('upload_file', async (data) => {
        const userId = socket.data.userId;
        if (!userId) return;

        try {
          const fileUrl = await this.saveFile(data.fileName, data.content);
          const message = await this.saveMessage({
            roomId: data.roomId,
            senderId: userId,
            content: `Shared file: ${data.fileName}`,
            messageType: this.getFileType(data.mimeType),
            fileUrl,
            fileName: data.fileName,
            fileSize: data.fileSize,
            mimeType: data.mimeType
          });

          this.io.to(data.roomId).emit('new_message', message);
        } catch (error) {
          console.error('Error uploading file:', error);
          socket.emit('message_error', 'Failed to upload file');
        }
      });

      // Disconnect
      socket.on('disconnect', async () => {
        const userId = socket.data.userId;
        if (userId) {
          this.userSockets.delete(userId);
          this.onlineUsers.delete(userId);
          
          // Update user's offline status
          await this.updateUserPresence(userId, false);
          
          // Broadcast user offline status
          this.broadcastUserPresence(userId, false);
        }
        console.log('User disconnected:', socket.id);
      });
    });
  }

  async authenticateUser(token) {
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
      return user;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  async joinUserRooms(socket, userId) {
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

  async saveMessage(data) {
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

  async editMessage(messageId, content, userId) {
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

  async deleteMessage(messageId, userId) {
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

  async saveFile(fileName, content) {
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

  getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('audio/')) return 'AUDIO';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    return 'FILE';
  }

  async markMessagesAsRead(roomId, userId) {
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

  async updateLastRead(roomId, userId) {
    await prisma.chatParticipant.updateMany({
      where: { roomId, userId },
      data: { lastReadAt: new Date() }
    });
  }

  async updateUserPresence(userId, isOnline) {
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

  broadcastUserPresence(userId, isOnline) {
    this.io.emit('user_presence', {
      userId,
      isOnline,
      lastSeen: new Date()
    });
  }

  getIO() {
    return this.io;
  }
}

module.exports = WebSocketServer; 