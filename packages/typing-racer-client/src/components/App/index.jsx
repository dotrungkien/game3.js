import React from 'react';
import AppContent from '../AppContent';
import AppStateProvider from './AppStateProvider';

import './style.css';

function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}

export default App;
