
import React from 'react';
import { Friend, Expense, User } from '../types';

interface FriendDetailViewProps {
  friend: Friend;
  expenses: Expense[];
  currentUser: User;
  onSettle: (id: string, amount: number) => void;
  onBack: () => void;
}

const FriendDetailView: React.FC<FriendDetailViewProps> = ({ friend, expenses, currentUser, onSettle, onBack }) => {
  // Filter expenses where both the currentUser and the friend are involved
  const sharedExpenses = expenses.filter(expense => {
    const involvesUser = expense.paidBy === currentUser.id || expense.participants.some(p => p.userId === currentUser.id);
    const involvesFriend = expense.paidBy === friend.id || expense.participants.some(p => p.userId === friend.id);
    return involvesUser && involvesFriend;
  });

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
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500">
          {friend.name[0]}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800">{friend.name}</h2>
          <p className={`text-sm font-medium ${friend.balance > 0 ? 'text-[#1CC29F]' : friend.balance < 0 ? 'text-[#FF652F]' : 'text-gray-400'}`}>
            {friend.balance > 0 
              ? `${friend.name} owes you $${friend.balance.toFixed(2)}` 
              : friend.balance < 0 
                ? `You owe ${friend.name} $${Math.abs(friend.balance).toFixed(2)}`
                : 'You are all settled up'}
          </p>
        </div>
        {friend.balance !== 0 && (
          <button 
            onClick={() => onSettle(friend.id, friend.balance)}
            className="bg-[#1CC29F] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
          >
            Settle
          </button>
        )}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Transaction History</h3>
        
        {sharedExpenses.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-sm">No shared expenses yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sharedExpenses.map(expense => {
              const userPaid = expense.paidBy === currentUser.id;
              const friendPaid = expense.paidBy === friend.id;
              
              // Calculate specific 1-on-1 impact
              // Amount friend owes user or user owes friend from this specific expense
              let impactText = '';
              let impactColor = 'text-gray-400';
              
              if (userPaid) {
                const friendPart = expense.participants.find(p => p.userId === friend.id)?.amount || 0;
                if (friendPart > 0) {
                  impactText = `you lent $${friendPart.toFixed(2)}`;
                  impactColor = 'text-[#1CC29F]';
                } else {
                  impactText = 'not involved';
                }
              } else if (friendPaid) {
                const userPart = expense.participants.find(p => p.userId === currentUser.id)?.amount || 0;
                if (userPart > 0) {
                  impactText = `you borrowed $${userPart.toFixed(2)}`;
                  impactColor = 'text-[#FF652F]';
                } else {
                  impactText = 'not involved';
                }
              } else {
                // Someone else paid
                const userPart = expense.participants.find(p => p.userId === currentUser.id)?.amount || 0;
                const friendPart = expense.participants.find(p => p.userId === friend.id)?.amount || 0;
                impactText = `shared expense`;
              }

              return (
                <div key={expense.id} className="flex items-center space-x-4 p-3 bg-white border border-gray-50 rounded-xl hover:shadow-sm transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl shadow-sm border border-gray-100">
                    {getCategoryIcon(expense.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate text-sm">{expense.description}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${impactColor}`}>
                      {impactText}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      total ${expense.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendDetailView;
