import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import NotFound from './pages/404';
import AuthPage from './pages/AuthPage';
import Bookings from './pages/Bookings';
import Events from './pages/Events';
import './App.css';
import MainNavigation from './components/Navigation/MainNavigation';

function App() {
  return (
    <BrowserRouter>
      <>
        <MainNavigation />
        <main className='main-content'>
          <Switch>
            <Redirect from='/' to='/auth' exact />
            <Route exact path='/auth' component={AuthPage} />
            <Route exact path='/events' component={Events} />
            <Route exact path='/bookings' component={Bookings} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </>
    </BrowserRouter>
  );
}

export default App;
