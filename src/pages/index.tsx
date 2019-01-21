import React from 'react';
import { Link } from 'gatsby';

const Index = () => (
  <div>
    <h1>Notes editor</h1>
    <p>
      Welcome to the notes editor. Check out the actual editor
      <Link to="/editor">here</Link>
    </p>
  </div>
);

export default Index;
