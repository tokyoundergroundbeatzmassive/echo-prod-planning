import React from 'react';
import Calendar from './components/Calendar';
import ProductionTable from './components/ProductionTable';

const App: React.FC = () => {
  return (
    <div className="p-4">
      <div className="container mx-auto">
        <Calendar />
        <ProductionTable />
      </div>
    </div>
  );
};

export default App;
