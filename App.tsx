
import React, { useState, useEffect, useMemo } from 'react';
import { Tab, User, Friend, Group, Expense, Participant } from './types';
import Dashboard from './components/Dashboard';
import RecentActivity from './components/RecentActivity';
import GroupsList from './components/GroupsList';
import FriendsList from './components/FriendsList';
import AIAssistant from './components/AIAssistant';
import AddExpenseModal from './components/AddExpenseModal';
import FriendDetailView from './components/FriendDetailView';
import Navbar from './components/Navbar';

const INITIAL_FRIENDS: Friend[] = [
  { id: 'f1', name: 'Alice Smith', email: 'alice@example.com', balance: 45.50 },
  { id: 'f2', name: 'Bob Johnson', email: 'bob@example.com', balance: -12.00 },
  { id: 'f3', name: 'Charlie Brown', email: 'charlie@example.com', balance: 0 },
];

const INITIAL_GROUPS: Group[] = [
  { id: 'g1', name: 'Apartment 4B', members: ['u1', 'f1', 'f2'], avatar: 'https://picsum.photos/seed/apt/200' },
  { id: 'g2', name: 'Road Trip 2024', members: ['u1', 'f1', 'f3'], avatar: 'https://picsum.photos/seed/trip/200' },
];

const CURRENT_USER: User = {
  id: 'u1',
  name: 'Me',
  email: 'me@example.com',
  avatar: 'https://picsum.photos/seed/me/200'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>(() => {
    const saved = localStorage.getItem('ss_friends');
    return saved ? JSON.parse(saved) : INITIAL_FRIENDS;
  });
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('ss_groups');
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('ss_expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('ss_friends', JSON.stringify(friends));
    localStorage.setItem('ss_groups', JSON.stringify(groups));
    localStorage.setItem('ss_expenses', JSON.stringify(expenses));
  }, [friends, groups, expenses]);

  const addExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expense: Expense = { ...newExpense, id: Date.now().toString() };
    setExpenses([expense, ...expenses]);
    
    // Update balances
    const updatedFriends = [...friends];
    expense.participants.forEach(p => {
      if (p.userId === CURRENT_USER.id) return;
      const friendIdx = updatedFriends.findIndex(f => f.id === p.userId);
      if (friendIdx > -1) {
        if (expense.paidBy === CURRENT_USER.id) {
          // You paid, they owe you more
          updatedFriends[friendIdx].balance += p.amount;
        } else if (expense.paidBy === p.userId) {
          // They paid, you owe them more
          // Find how much YOU are supposed to pay in this expense
          const yourPart = expense.participants.find(part => part.userId === CURRENT_USER.id)?.amount || 0;
          updatedFriends[friendIdx].balance -= yourPart;
        }
      }
    });
    setFriends(updatedFriends);
  };

  const settleUp = (friendId: string, amount: number) => {
    const friend = friends.find(f => f.id === friendId);
    if (!friend) return;

    const settlementExpense: Expense = {
      id: Date.now().toString(),
      description: `Settlement with ${friend.name}`,
      amount: Math.abs(amount),
      date: new Date().toISOString(),
      paidBy: amount > 0 ? friendId : CURRENT_USER.id,
      category: 'other',
      participants: [
        { userId: CURRENT_USER.id, amount: Math.abs(amount) / 2 },
        { userId: friendId, amount: Math.abs(amount) / 2 }
      ]
    };

    setExpenses([settlementExpense, ...expenses]);
    setFriends(friends.map(f => f.id === friendId ? { ...f, balance: 0 } : f));
  };

  const handleTabChange = (tab: Tab) => {
    setSelectedFriendId(null);
    setActiveTab(tab);
  };

  const renderContent = () => {
    if (selectedFriendId) {
      const friend = friends.find(f => f.id === selectedFriendId);
      if (friend) {
        return (
          <FriendDetailView 
            friend={friend} 
            expenses={expenses} 
            currentUser={CURRENT_USER} 
            onSettle={settleUp}
            onBack={() => setSelectedFriendId(null)}
          />
        );
      }
    }

    switch (activeTab) {
      case Tab.DASHBOARD:
        return (
          <Dashboard 
            currentUser={CURRENT_USER} 
            friends={friends} 
            expenses={expenses} 
            onSettle={settleUp} 
            onViewFriend={setSelectedFriendId}
          />
        );
      case Tab.RECENT:
        return <RecentActivity expenses={expenses} currentUser={CURRENT_USER} friends={friends} />;
      case Tab.GROUPS:
        return <GroupsList groups={groups} />;
      case Tab.FRIENDS:
        return <FriendsList friends={friends} onSettle={settleUp} onViewFriend={setSelectedFriendId} />;
      case Tab.AI:
        return <AIAssistant expenses={expenses} friends={friends} />;
      default:
        return <Dashboard currentUser={CURRENT_USER} friends={friends} expenses={expenses} onSettle={settleUp} onViewFriend={setSelectedFriendId} />;
    }
  };

  return (
    <div className="min-h-screen pb-24 max-w-xl mx-auto bg-white shadow-xl relative">
      <header className="sticky top-0 z-40 bg-[#1CC29F] text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight">SplitSmart AI</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white text-[#1CC29F] px-3 py-1 rounded-full text-sm font-bold shadow-sm"
          >
            + Add Expense
          </button>
        </div>
      </header>

      <main className="p-4">
        {renderContent()}
      </main>

      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

      {isAddModalOpen && (
        <AddExpenseModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={addExpense}
          friends={friends}
          currentUser={CURRENT_USER}
        />
      )}
    </div>
  );
};

export default App;
