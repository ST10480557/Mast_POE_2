import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import ChefDashboard from './components/ChefDashboard';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/dashboard" component={ChefDashboard} />
      </Switch>
    </Router>
  );
};

export default App;