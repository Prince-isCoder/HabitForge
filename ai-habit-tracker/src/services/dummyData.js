export const mockUser = {
  name: "Alex",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  joinDate: "January 2024",
  streak: 12,
  level: "Consistency Master"
};

export const todaysHabits = [
  { id: 1, title: "Morning Meditation", category: "Mindfulness", icon: "Brain", color: "bg-indigo-500", completed: true, streak: 15, target: "15 mins" },
  { id: 2, title: "Read 10 Pages", category: "Learning", icon: "BookOpen", color: "bg-emerald-500", completed: false, streak: 4, target: "10 pages" },
  { id: 3, title: "Drink 2L Water", category: "Health", icon: "Droplet", color: "bg-blue-500", completed: false, streak: 21, target: "2 liters" },
  { id: 4, title: "Workout", category: "Fitness", icon: "Dumbbell", color: "bg-orange-500", completed: true, streak: 8, target: "45 mins" },
  { id: 5, title: "Journaling", category: "Mindfulness", icon: "PenTool", color: "bg-purple-500", completed: false, streak: 2, target: "5 mins" }
];

export const allHabitsList = [
  ...todaysHabits,
  { id: 6, title: "No Sugar", category: "Diet", icon: "Coffee", color: "bg-red-500", completed: false, streak: 0, target: "All day" },
  { id: 7, title: "Walk outside", category: "Fitness", icon: "Footprints", color: "bg-green-500", completed: true, streak: 30, target: "10k steps" },
];

export const weeklyProgressData = [
  { name: 'Mon', completed: 4, total: 5 },
  { name: 'Tue', completed: 5, total: 5 },
  { name: 'Wed', completed: 3, total: 5 },
  { name: 'Thu', completed: 4, total: 5 },
  { name: 'Fri', completed: 5, total: 5 },
  { name: 'Sat', completed: 2, total: 5 },
  { name: 'Sun', completed: 4, total: 5 },
];

export const productivityData = [
  { time: '6am', focus: 30 },
  { time: '10am', focus: 80 },
  { time: '2pm', focus: 65 },
  { time: '6pm', focus: 40 },
  { time: '10pm', focus: 10 },
];

export const mockChatHistory = [
  { id: 1, sender: "ai", text: "Good morning, Alex! You've got a 12-day streak going. Ready to tackle your habits today?", timestamp: "08:00 AM" },
  { id: 2, sender: "user", text: "Yes! But I might not have time for a full workout.", timestamp: "08:05 AM" },
  { id: 3, sender: "ai", text: "No problem. How about a quick 15-minute HIIT session instead? It keeps the habit alive without taking too much time.", timestamp: "08:06 AM" },
];
