
import React from 'react';
import { User, Friend, Expense } from '../types';

interface DashboardProps {
  currentUser: User;
  friends: Friend[];
  expenses: Expense[];
  onSettle: (id: string, amount: number) => void;
  onViewFriend: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, friends, expenses, onSettle, onViewFriend }) => {
  const youAreOwed = friends.filter(f => f.balance > 0).reduce((acc, f) => acc + f.balance, 0);
  const youOwe = friends.filter(f => f.balance < 0).reduce((acc, f) => acc + Math.abs(f.balance), 0);
  const totalBalance = youAreOwed - youOwe;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 divide-x border rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="p-4 text-center">
          <p className="text-xs text-gray-500 font-medium mb-1">Total balance</p>
          <p className={`text-lg font-bold ${totalBalance >= 0 ? 'text-[#1CC29F]' : 'text-[#FF652F]'}`}>
            {totalBalance >= 0 ? '+' : '-'}${Math.abs(totalBalance).toFixed(2)}
          </p>
        </div>
        <div className="p-4 text-center">
          <p className="text-xs text-gray-500 font-medium mb-1">You owe</p>
          <p className="text-lg font-bold text-[#FF652F]">${youOwe.toFixed(2)}</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-xs text-gray-500 font-medium mb-1">You are owed</p>
          <p className="text-lg font-bold text-[#1CC29F]">${youAreOwed.toFixed(2)}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Balances</h2>
        </div>
        
        <div className="space-y-3">
          {friends.filter(f => f.balance !== 0).length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">You are all settled up!</p>
            </div>
          ) : (
            friends.filter(f => f.balance !== 0).map(friend => (
              <div 
                key={friend.id} 
                className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#1CC29F]/30 transition-colors cursor-pointer group"
                onClick={() => onViewFriend(friend.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 group-hover:bg-[#1CC29F]/10 group-hover:text-[#1CC29F] transition-colors">
                    {friend.name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{friend.name}</h3>
                    <p className={`text-xs ${friend.balance > 0 ? 'text-[#1CC29F]' : 'text-[#FF652F]'}`}>
                      {friend.balance > 0 ? 'owes you' : 'you owe'} ${Math.abs(friend.balance).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSettle(friend.id, friend.balance);
                    }}
                    className="px-4 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Settle Up
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
