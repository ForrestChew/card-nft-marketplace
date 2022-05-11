import { Routes, Route } from 'react-router-dom';
import { ConnectButton } from 'web3uikit';
import NavigationBar from './NavigationBar';
import About from './About';
import Marketplace from './Marketplace';
import LeaderBoard from './LeaderBoard';
import Profile from './Profile';
import '.././styles/app.css';
const App = () => {
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
        <Route path='/profile' elemnt={<Profile />} />
      </Routes>
    </>
  );
};

export default App;
