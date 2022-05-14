import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConnectButton } from 'web3uikit';
import { useMoralis } from 'react-moralis';
import NavigationBar from './NavigationBar';
import About from './About';
import Marketplace from './Marketplace';
import LeaderBoard from './LeaderBoard';
import Profile from './Profile';
import '../styles/app.css';

const App = () => {
  const [userAddress, setUserAddress] = useState('');
  const { user, isAuthenticated } = useMoralis();
  useEffect(() => {
    if (isAuthenticated) {
      setUserAddress(user.get('ethAddress'));
      console.log(user.get('ethAddress'));
    }
  });

  return (
    <>
      <div className='navbar-container'>
        <NavigationBar />
        <ConnectButton />
      </div>
      <Routes>
        <Route path='/' element={<About />} />
        <Route path='/marketplace' element={<Marketplace />} />
        <Route path='/leader-board' element={<LeaderBoard />} />
        <Route
          path='/profile'
          element={<Profile userAddress={userAddress} />}
        />
      </Routes>
    </>
  );
};

export default App;
