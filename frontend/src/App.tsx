import React, { useState } from 'react';
import Calendar from './components/Calendar';
import ProductionTable from './components/ProductionTable';

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="p-4">
      <div className="container mx-auto">
        <Calendar onDateSelect={setSelectedDate} />
        <ProductionTable selectedDate={selectedDate} />
      </div>
    </div>
  );
};

export default App;
