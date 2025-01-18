import React, { useState } from 'react';
import Calendar from './components/Calendar';
import ProductionSchedule from './components/ProductionSchedule';
import ProductionTable from './components/ProductionTable';

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'schedule' | 'table'>('schedule');

  return (
    <div className="p-4">
      <div className="container mx-auto">
        <Calendar onDateSelect={setSelectedDate} />

        {/* タブ切り替えボタン */}
        <div className="flex gap-4 mt-4 mb-2">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded ${activeTab === 'schedule'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
              }`}
          >
            スケジュール
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`px-4 py-2 rounded ${activeTab === 'table'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
              }`}
          >
            生産計画表
          </button>
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'schedule' ? (
          <ProductionSchedule />
        ) : (
          <ProductionTable selectedDate={selectedDate} />
        )}
      </div>
    </div>
  );
};

export default App;
