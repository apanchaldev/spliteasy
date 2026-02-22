
import React from 'react';
import { Group } from '../types';

interface GroupsListProps {
  groups: Group[];
}

const GroupsList: React.FC<GroupsListProps> = ({ groups }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Groups</h2>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {groups.map(group => (
          <div key={group.id} className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all hover:border-[#1CC29F]/30 hover:shadow-md cursor-pointer">
            <img 
              src={group.avatar || `https://picsum.photos/seed/${group.id}/200`} 
              className="w-16 h-16 rounded-xl object-cover bg-gray-100"
              alt={group.name}
            />
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">{group.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{group.members.length} members</p>
            </div>
            <div className="text-[#1CC29F]">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>
        ))}
        
        <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all">
          <span className="font-bold">+ Create a new group</span>
        </button>
      </div>
    </div>
  );
};

export default GroupsList;
