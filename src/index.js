import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MoralisProvider } from 'react-moralis';
import App from './components/App';

const MORALIS_SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;
const MORALIS_APP_ID = process.env.REACT_APP_MORALIS_APP_ID;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MoralisProvider serverUrl={MORALIS_SERVER_URL} appId={MORALIS_APP_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MoralisProvider>
  </React.StrictMode>
);
