import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Notification {
  _id: string;
  message: string;
  type: string;
  status: 'unread' | 'read';
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    axios.get('/api/notifications')
      .then((response) => {
        setNotifications(response.data.data);
      })
      .catch((error) => {
        console.error('Error fetching notifications:', error);
      });
  }, []);

  const markAsRead = (id: string) => {
    axios.patch(`/api/notifications/${id}`)
      .then(() => {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification._id === id ? { ...notification, status: 'read' } : notification
          )
        );
      })
      .catch((error) => {
        console.error('Error updating notification status:', error);
      });
  };

  return (
    <div className="absolute right-0 top-12 bg-white shadow-lg rounded-md w-64">
      <div className="p-4 text-lg font-semibold">Notifications</div>
      <ul className="max-h-60 overflow-y-auto">
        {notifications.map((notification) => (
          <li
            key={notification._id}
            className={`p-3 ${notification.status === 'unread' ? 'bg-gray-100' : ''}`}
            onClick={() => markAsRead(notification._id)}
          >
            <p>{notification.message}</p>
            <span className="text-xs text-gray-400">{notification.type}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
