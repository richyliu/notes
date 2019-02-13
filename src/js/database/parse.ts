import {Database, Note} from '../database';

const headers = new Headers({
  'X-Parse-Application-Id': '7ngryN9HNZj6MjUGOwSraXk5Fnolq3NYSpHoz7T1',
  'X-Parse-Javascript-Key': '5sJCo3VWSLH1oIB0UV9xG8IyKpy667q2NtK5QCNZ',
});
const url = 'https://parseapi.back4app.com/';

const Parse: Database = {
  async isNote(id: string) {
    console.error('[js]: isNote in Parse is not yet implemented');
    return false;
  },
  async getNote(id: string) {
    try {
      const res = await fetch(`${url}classes/Note/${id}`, {
        method: 'GET',
        headers: headers,
      });
      const note = await res.json();

      return note.content;
    } catch (e) {
      return ['', `[js]: [ParseDb]: getNote error: ${e.message}`];
    }
  },
  async setNote(id: string, note: Note) {
    try {
      const res = await fetch(`${url}classes/Note/${id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({content: note}),
      });
    } catch (e) {
      return `[js]: [ParseDb]: getNote error: ${e.message}`;
    }
  },
  async addNote(note: string) {
    console.error('[js]: addNote in Parse is not yet implemented');
    return Math.floor(Math.random() * 10000000).toString(16);
  },
};

export default Parse;
