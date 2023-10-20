import { createRoot } from 'react-dom/client';
import App from './App';

window.addEventListener('storage', () => {
  // When local storage changes, dump the list to
  // the console.
  console.log(window.localStorage);
});

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);
