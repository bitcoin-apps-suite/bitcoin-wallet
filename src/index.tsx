import { Buffer } from 'buffer';
import process from 'process';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ServiceProvider } from './contexts/providers/ServiceProvider';
import { ThemeProvider } from './contexts/providers/ThemeProvider';
import { Web3RequestProvider } from './contexts/providers/Web3Provider';
import './index.css';
global.Buffer = Buffer;
global.process = process;
window.Buffer = Buffer;

const root = document.getElementById('root');
if (!root) throw new Error('Root element');
const rootDiv = ReactDOM.createRoot(root);
rootDiv.render(
  <Web3RequestProvider>
    <ServiceProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ServiceProvider>
  </Web3RequestProvider>,
);

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('PWA Service Worker registered:', registration);
        
        // Handle protocol launches
        if (window.location.search.includes('action=')) {
          const params = new URLSearchParams(window.location.search);
          const action = params.get('action');
          console.log('Protocol launch action:', action);
          // Handle the action in your app
        }
      })
      .catch((error) => {
        console.error('PWA Service Worker registration failed:', error);
      });
  });
}
