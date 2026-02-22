import React, { useState, useEffect } from 'react';
import { Friend, User, Expense } from '../types';
import { parseNaturalLanguageExpense } from '../services/geminiService';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  friends: Friend[];
  currentUser: User;
}

type SplitMode = 'equally' | 'exact';

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onClose, onAdd, friends, currentUser }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(currentUser.id);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [category, setCategory] = useState<Expense['category']>('food');
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  
  const [splitMode, setSplitMode] = useState<SplitMode>('equally');
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});

  const allParticipants = [currentUser.id, ...selectedFriends];

  // Initialize exact amounts when participants or amount change
  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    if (splitMode === 'equally' && allParticipants.length > 0) {
      const equalShare = (numAmount / allParticipants.length).toFixed(2);
      const newExacts: Record<string, string> = {};
      allParticipants.forEach(id => {
        newExacts[id] = equalShare;
      });
      setExactAmounts(newExacts);
    }
  }, [amount, selectedFriends, splitMode]);

  const handleAIScan = async () => {
    if (!aiInput.trim()) return;
    setIsAILoading(true);
    const result = await parseNaturalLanguageExpense(aiInput);
    if (result) {
      setDescription(result.description || '');
      setAmount(result.amount?.toString() || '');
      setCategory(result.category || 'food');
      
      if (result.participants) {
        const matches = friends
          .filter(f => result.participants.some((p: string) => f.name.toLowerCase().includes(p.toLowerCase())))
          .map(f => f.id);
        setSelectedFriends(matches);
      }
    }
    setIsAILoading(false);
  };

  // Fixed TypeScript errors by explicitly typing the reduce arguments and casting values to ensure number operations
  const totalExact = Object.values(exactAmounts).reduce((acc: number, val) => acc + (parseFloat(val as string) || 0), 0);
  const amountDiff = (parseFloat(amount) || 0) - (totalExact as number);
  const isSplitValid = splitMode === 'equally' || Math.abs(amountDiff) < 0.01;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !isSplitValid) return;

    const numAmount = parseFloat(amount);
    
    const participants = allParticipants.map(id => ({
      userId: id,
      amount: splitMode === 'equally' ? numAmount / allParticipants.length : (parseFloat(exactAmounts[id]) || 0)
    }));

    onAdd({
      description,
      amount: numAmount,
      date: new Date().toISOString(),
      paidBy,
      category,
      participants
    });
    onClose();
  };

  const getPersonName = (id: string) => id === currentUser.id ? 'You' : friends.find(f => f.id === id)?.name || 'Unknown';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-800">Add an expense</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI Helper Section */}
          <div className="bg-[#1CC29F]/10 p-4 rounded-xl border border-[#1CC29F]/20">
            <label className="block text-xs font-bold text-[#1CC29F] uppercase tracking-wider mb-2">Smart AI Add</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Dinner at Mario's 120 with Bob"
                className="flex-1 text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#1CC29F]"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAIScan}
                disabled={isAILoading}
                className="bg-[#1CC29F] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm disabled:opacity-50"
              >
                {isAILoading ? '...' : 'Scan'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                <input
                  type="text"
                  required
                  className="w-full text-lg font-medium bg-transparent border-b-2 border-gray-100 focus:border-[#1CC29F] outline-none py-1 transition-colors"
                  placeholder="What was it for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Amount ($)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    className="w-full text-lg font-medium bg-transparent border-b-2 border-gray-100 focus:border-[#1CC29F] outline-none py-1 transition-colors"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="w-1/3">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                  <select
                    className="w-full text-sm bg-transparent border-b-2 border-gray-100 focus:border-[#1CC29F] outline-none py-2 capitalize cursor-pointer"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                  >
                    <option value="food">Food</option>
                    <option value="rent">Rent</option>
                    <option value="travel">Travel</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Paid by</span>
                <select 
                  className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#1CC29F]"
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                >
                  <option value={currentUser.id}>You</option>
                  {friends.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Split</span>
                <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                  <button 
                    type="button"
                    onClick={() => setSplitMode('equally')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${splitMode === 'equally' ? 'bg-[#1CC29F] text-white' : 'text-gray-500'}`}
                  >
                    Equally
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSplitMode('exact')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${splitMode === 'exact' ? 'bg-[#1CC29F] text-white' : 'text-gray-500'}`}
                  >
                    Exact
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Involved people</label>
              <div className="space-y-2">
                {/* Current User always included or can be toggled if needed, for simplicity we keep them as toggleable if they are chosen or always first */}
                <div className="flex items-center justify-between p-2 rounded-lg border border-gray-50 bg-white">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-[#1CC29F] text-white flex items-center justify-center text-xs font-bold">You</div>
                      <span className="text-sm font-medium">You</span>
                    </div>
                    {splitMode === 'exact' && (
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                        <input 
                          type="number"
                          className="w-24 pl-5 pr-2 py-1 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-[#1CC29F]"
                          value={exactAmounts[currentUser.id] || ''}
                          onChange={(e) => setExactAmounts({...exactAmounts, [currentUser.id]: e.target.value})}
                        />
                      </div>
                    )}
                </div>

                {friends.map(friend => {
                  const isSelected = selectedFriends.includes(friend.id);
                  return (
                    <div key={friend.id} className={`flex items-center justify-between p-2 rounded-lg border transition-all ${isSelected ? 'border-[#1CC29F]/30 bg-[#1CC29F]/5' : 'border-gray-50 bg-white opacity-60'}`}>
                      <button
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedFriends(selectedFriends.filter(id => id !== friend.id));
                          } else {
                            setSelectedFriends([...selectedFriends, friend.id]);
                          }
                        }}
                        className="flex items-center space-x-2 text-left"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-[#1CC29F] text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {friend.name[0]}
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? 'text-gray-800' : 'text-gray-400'}`}>{friend.name}</span>
                      </button>
                      
                      {isSelected && splitMode === 'exact' && (
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                          <input 
                            type="number"
                            className="w-24 pl-5 pr-2 py-1 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-[#1CC29F]"
                            value={exactAmounts[friend.id] || ''}
                            onChange={(e) => setExactAmounts({...exactAmounts, [friend.id]: e.target.value})}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {splitMode === 'exact' && !isSplitValid && (
                <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Remaining to split: ${amountDiff.toFixed(2)}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!isSplitValid || !description || !amount}
                className="w-full bg-[#1CC29F] hover:bg-[#18A688] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#1CC29F]/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
              >
                Save Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;