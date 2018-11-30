import React from 'react';

import Navbar from 'react-bulma-components/lib/components/navbar';
import Button from 'react-bulma-components/lib/components/button';
// import {
//   Field,
//   Label,
//   Input
// } from 'react-bulma-components/lib/components/form';

const NoteMenuNavbar: React.FunctionComponent = () => {
  return (
    <Navbar>
      <Navbar.Brand>
        <Navbar.Item>
          {/* <Field>
            <Label>foo</Label>
            <Input type="text" placeholder="Search..." />
          </Field> */}
        </Navbar.Item>
        <Navbar.Burger onClick={() => console.log('fo')} />
      </Navbar.Brand>
      <Navbar.Menu>
        <Navbar.Container>
          <Navbar.Item>
            <Button>hello</Button>
          </Navbar.Item>
        </Navbar.Container>
      </Navbar.Menu>
    </Navbar>
  );
};

export default NoteMenuNavbar;
