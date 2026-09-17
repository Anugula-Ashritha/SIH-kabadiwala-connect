import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {RoleSelectionScreen} from './screens/RoleSelectionScreen';
import './index.css';

const isCollectorMode = new URLSearchParams(window.location.search).get('role') === 'collector';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isCollectorMode ? <App /> : <RoleSelectionScreen />}
  </StrictMode>,
);
