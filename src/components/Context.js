import React, { useEffect, useState } from 'react';

export const AppContext = React.createContext();

const Context = ({ children }) => {
  const [activePack, setActivePack] = useState({});

  return (
    <>
      <AppContext.Provider value={[activePack, setActivePack]}>
        {children}
      </AppContext.Provider>
    </>
  );
};

export default Context;
