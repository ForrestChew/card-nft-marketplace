import { NFTBalance, Card } from 'web3uikit';
import '../styles/app.css';

const Profile = (userAddress) => {
  return (
    <>
      <div className='nfts-container-profile'>
        <NFTBalance chain='mumbai' address={userAddress.userAddress} />
      </div>
    </>
  );
};

export default Profile;
