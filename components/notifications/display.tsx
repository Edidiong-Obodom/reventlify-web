"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MoreVertical,
  Check,
  X,
  Bell,
  User,
  Calendar,
  Heart,
} from "lucide-react";
import Image from "next/image";

interface Notification {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  type: "invite" | "follow" | "like" | "join";
  content: string;
  eventName?: string;
  time: string;
  read: boolean;
  accepted?: boolean;
  rejected?: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    user: {
      name: "David Silbia",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    type: "invite",
    content: "Invite",
    eventName: "Jo Malone London's Mother's",
    time: "Just now",
    read: false,
  },
  {
    id: "2",
    user: {
      name: "Adnan Safi",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    type: "follow",
    content: "Started following you",
    time: "5 min ago",
    read: false,
  },
  {
    id: "3",
    user: {
      name: "Joan Baker",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    type: "invite",
    content: "Invite",
    eventName: "A virtual Evening of Smooth Jazz",
    time: "20 min ago",
    read: false,
  },
  {
    id: "4",
    user: {
      name: "Ronald C. Kinch",
      avatar:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    type: "like",
    content: "Like your events",
    time: "1 hr ago",
    read: true,
  },
  {
    id: "5",
    user: {
      name: "Clara Tolson",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    type: "join",
    content: "Join your Event",
    eventName: "Gala Music Festival",
    time: "9 hr ago",
    read: true,
  },
  {
    id: "6",
    user: {
      name: "Jennifer Fritz",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    type: "invite",
    content: "Invite you",
    eventName: "International Kids Safe",
    time: "Tue, 5:10 pm",
    read: true,
  },
  {
    id: "7",
    user: {
      name: "Eric G. Prickett",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    type: "follow",
    content: "Started following you",
    time: "Wed, 3:30 pm",
    read: true,
  },
  {
    id: "8",
    user: {
      name: "David Silbia",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    type: "invite",
    content: "Invite",
    eventName: "Jo Malone London's Mother's",
    time: "Just now",
    read: false,
  },
  {
    id: "9",
    user: {
      name: "Adnan Safi",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    type: "follow",
    content: "Started following you",
    time: "5 min ago",
    read: false,
  },
  {
    id: "10",
    user: {
      name: "Joan Baker",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    type: "invite",
    content: "Invite",
    eventName: "A virtual Evening of Smooth Jazz",
    time: "20 min ago",
    read: false,
  },
  {
    id: "11",
    user: {
      name: "Ronald C. Kinch",
      avatar:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    type: "like",
    content: "Like your events",
    time: "1 hr ago",
    read: true,
  },
  {
    id: "12",
    user: {
      name: "Clara Tolson",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    type: "join",
    content: "Join your Event",
    eventName: "Gala Music Festival",
    time: "9 hr ago",
    read: true,
  },
  {
    id: "13",
    user: {
      name: "Jennifer Fritz",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    type: "invite",
    content: "Invite you",
    eventName: "International Kids Safe",
    time: "Tue, 5:10 pm",
    read: true,
  },
  {
    id: "14",
    user: {
      name: "Eric G. Prickett",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    type: "follow",
    content: "Started following you",
    time: "Wed, 3:30 pm",
    read: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [showMenu, setShowMenu] = useState(false);

  const handleAccept = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, read: true, accepted: true }
          : notification
      )
    );
  };

  const handleReject = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, read: true, rejected: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
    setShowMenu(false);
  };

  const clearAll = () => {
    setNotifications([]);
    setShowMenu(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "invite":
        return <Calendar className="w-4 h-4 text-[#5850EC]" />;
      case "follow":
        return <User className="w-4 h-4 text-[#5850EC]" />;
      case "like":
        return <Heart className="w-4 h-4 text-[#5850EC]" />;
      case "join":
        return <Bell className="w-4 h-4 text-[#5850EC]" />;
      default:
        return <Bell className="w-4 h-4 text-[#5850EC]" />;
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-800 hover:text-gray-600"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold">Notification</h1>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="w-6 h-6" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                  <button
                    onClick={markAllAsRead}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mark all as read
                  </button>
                  <button
                    onClick={clearAll}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Clear all notifications
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notifications List */}
      <main className="max-w-3xl mx-auto px-4 py-2 md:py-6">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-[#5850EC]/10 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-[#5850EC]" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No notifications</h2>
            <p className="text-gray-500 text-center max-w-md">
              You don't have any notifications at the moment. We'll notify you
              when something happens!
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`py-4 flex items-start ${
                  notification.read ? "" : "bg-blue-50 -mx-4 px-4 md:rounded-lg"
                }`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={
                      notification.user.avatar ||
                      "/placeholder.svg?height=48&width=48"
                    }
                    alt={notification.user.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-bold">
                          {notification.user.name}
                        </span>
                        <span className="text-gray-600">
                          {notification.content} {notification.eventName}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 md:mt-0">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <span className="hidden md:inline-block">
                            {getNotificationIcon(notification.type)}
                          </span>
                          {notification.time}
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-sm text-gray-500 md:ml-4 md:flex-shrink-0">
                      {notification.type === "invite" &&
                        !notification?.accepted &&
                        !notification.rejected && (
                          <div className="flex gap-2 mt-3 md:mt-0">
                            <button
                              onClick={() => handleReject(notification.id)}
                              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleAccept(notification.id)}
                              className="px-6 py-2 bg-[#5850EC] text-white rounded-md hover:bg-[#6C63FF] transition-colors"
                            >
                              Accept
                            </button>
                          </div>
                        )}
                      {notification.accepted && (
                        <span className="inline-flex items-center text-green-600">
                          <Check className="w-4 h-4 mr-1" /> Accepted
                        </span>
                      )}
                      {notification.rejected && (
                        <span className="inline-flex items-center text-red-600">
                          <X className="w-4 h-4 mr-1" /> Rejected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
