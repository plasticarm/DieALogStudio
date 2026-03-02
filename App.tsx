import React, { useState, useEffect } from 'react';
import { auth } from './services/firebase';
import Login from './components/Login';
import Inventory from './components/Inventory';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <button onClick={handleLogout}>Logout</button>
          <Inventory />
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default App;
