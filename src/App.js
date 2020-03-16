import React, { useState } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import { AuthContext } from './context/auth-context';
import MainNavigation from './components/Navigation/MainNavigation';
import AuthPage from './pages/AuthPage';
import Bookings from './pages/Bookings';
import Events from './pages/Events';
import NotFound from './pages/404';
import './App.css';
function App() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const login = (token, userId, tokenExpiration) => {
    setToken(token);
    setUserId(userId);
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, login, logout }}>
      <BrowserRouter>
        <>
          <MainNavigation />
          <main className='main-content'>
            <Switch>
              {!token && <Redirect from='/' to='/auth' exact />}
              {token && <Redirect from='/' to='/events' exact />}
              {token && <Redirect from='/auth' to='/events' exact />}

              {!token && <Route exact path='/auth' component={AuthPage} />}
              <Route exact path='/events' component={Events} />
              {token && <Route exact path='/bookings' component={Bookings} />}
              <Route component={NotFound} />
            </Switch>
          </main>
        </>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
