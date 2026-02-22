
import React from 'react';
import { Expense, User, Friend } from '../types';

interface RecentActivityProps {
  expenses: Expense[];
  currentUser: User;
  friends: Friend[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ expenses, currentUser, friends }) => {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>No recent activity</p>
        <p className="text-sm">Expenses will show up here</p>
      </div>
    );
  }

  const getPayerName = (id: string) => {
    if (id === currentUser.id) return 'You';
    return friends.find(f => f.id === id)?.name || 'Unknown';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return '🍔';
      case 'rent': return '🏠';
      case 'travel': return '✈️';
      case 'entertainment': return '🎟️';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
      <div className="space-y-3">
        {expenses.map((expense) => {
          const youParticipated = expense.participants.some(p => p.userId === currentUser.id);
          const yourPart = expense.participants.find(p => p.userId === currentUser.id)?.amount || 0;
          
          let statusText = '';
          let statusColor = '';
          
          if (expense.paidBy === currentUser.id) {
            statusText = `you lent $${(expense.amount - yourPart).toFixed(2)}`;
            statusColor = 'text-[#1CC29F]';
          } else if (youParticipated) {
            statusText = `you borrowed $${yourPart.toFixed(2)}`;
            statusColor = 'text-[#FF652F]';
          } else {
            statusText = 'not involved';
            statusColor = 'text-gray-400';
          }

          return (
            <div key={expense.id} className="flex items-center space-x-4 p-3 bg-white border-b last:border-0 border-gray-100">
              <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-2xl shadow-sm border border-gray-100">
                {getCategoryIcon(expense.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 truncate">{expense.description}</h4>
                <p className="text-xs text-gray-500">
                  {getPayerName(expense.paidBy)} paid ${expense.amount.toFixed(2)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold ${statusColor}`}>
                  {statusText}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
