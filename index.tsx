import React from 'react';
import ReactDOM from 'react-dom/client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import App from './App'; // Your main app component

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <GestureHandlerRootView style={{ flex: 1 }}>
    <App />
  </GestureHandlerRootView>
);
