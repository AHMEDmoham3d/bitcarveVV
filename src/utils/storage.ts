import { AppData, User, Message } from '../types';

const STORAGE_KEY = 'bitcarve_data';
const ADMIN_PASSWORD = 'BitCarve2024Admin!';

const defaultData: AppData = {
  users: [],
  messages: [],
  adminPassword: ADMIN_PASSWORD
};

export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return { ...defaultData, ...data };
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  return defaultData;
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const getUsers = (): User[] => {
  return loadData().users;
};

export const getMessages = (): Message[] => {
  return loadData().messages;
};

export const addUser = (user: User): void => {
  const data = loadData();
  data.users.push(user);
  saveData(data);
};

export const updateUser = (userId: string, updates: Partial<User>): void => {
  const data = loadData();
  const userIndex = data.users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    data.users[userIndex] = { ...data.users[userIndex], ...updates };
    saveData(data);
  }
};

export const deleteUser = (userId: string): void => {
  const data = loadData();
  data.users = data.users.filter(u => u.id !== userId);
  data.messages = data.messages.filter(m => m.fromUserId !== userId);
  saveData(data);
};

export const addMessage = (message: Message): void => {
  const data = loadData();
  data.messages.push(message);
  saveData(data);
};

export const updateMessage = (messageId: string, updates: Partial<Message>): void => {
  const data = loadData();
  const messageIndex = data.messages.findIndex(m => m.id === messageId);
  if (messageIndex !== -1) {
    data.messages[messageIndex] = { ...data.messages[messageIndex], ...updates };
    saveData(data);
  }
};

export const getAdminPassword = (): string => {
  return ADMIN_PASSWORD;
};

export const authenticateUser = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  return user && !user.isBanned ? user : null;
};

export const authenticateAdmin = (password: string): boolean => {
  return password === ADMIN_PASSWORD;
};