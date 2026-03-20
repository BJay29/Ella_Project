import { useContext } from 'react';
import { NotificationContext } from './NotificationContext';

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider. Wrap your app in <NotificationProvider> inside main.jsx.');
  }
  return context;
};