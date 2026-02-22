
import React from 'react';
import { Friend } from '../types';

interface FriendsListProps {
  friends: Friend[];
  onSettle: (id: string, amount: number) => void;
  onViewFriend: (id: string) => void;
}

const FriendsList: React.FC<FriendsListProps> = ({ friends, onSettle, onViewFriend }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800">Friends</h2>
      <div className="space-y-2">
        {friends.map(friend => (
          <div 
            key={friend.id} 
            className="group flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-50 transition-all hover:bg-gray-50 hover:border-[#1CC29F]/20 cursor-pointer"
            onClick={() => onViewFriend(friend.id)}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-500 shadow-inner group-hover:from-[#1CC29F]/10 group-hover:to-[#1CC29F]/20">
                {friend.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{friend.name}</h3>
                <p className="text-xs text-gray-400">{friend.email}</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <p className={`text-sm font-bold ${friend.balance > 0 ? 'text-[#1CC29F]' : friend.balance < 0 ? 'text-[#FF652F]' : 'text-gray-300'}`}>
                {friend.balance === 0 ? 'Settled up' : `${friend.balance > 0 ? 'owes you' : 'you owe'} $${Math.abs(friend.balance).toFixed(2)}`}
              </p>
              {friend.balance !== 0 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSettle(friend.id, friend.balance);
                  }}
                  className="mt-1 text-[10px] font-bold text-gray-400 hover:text-[#1CC29F] uppercase tracking-wider"
                >
                  Quick Settle
                </button>
              )}
            </div>
          </div>
        ))}

        <button className="w-full py-4 mt-4 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-50">
          <span>Add friend by email</span>
        </button>
      </div>
    </div>
  );
};

export default FriendsList;
