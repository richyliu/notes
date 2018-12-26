import React from 'react';
import { Switch, Route } from 'react-router';
import App from './app/App';
import Page404 from './404/Page404';

const Base: React.FunctionComponent = () => {
  return (
    <Switch>
      <Route exact path="/" component={App} />
      <Route component={Page404} />
    </Switch>
  );
};

export default Base;
