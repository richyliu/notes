import {Database, Note} from '../database';

let notes: {[key: string]: string} = {
  foo: 'bar baz',
  ImwmPGfDkl: '# foo\nbar baz',
};

const InMemory: Database = {
  async isNote(id: string) {
    return Boolean(notes[id]);
  },
  async getNote(id: string) {
    if (await this.isNote(id)) return notes[id];
    else return ['', `Note id: ${id} does not exist.`];
  },
  async setNote(id: string, note: Note) {
    notes[id] = note;
    return undefined;
  },
  async addNote(note: string) {
    if (Math.random() < 0.3) {
      return ['', 'Failed to add note (randomly generated error)'];
    }
    const id = (Math.random() + '').slice(2);
    notes[id] = note;
    return id;
  },
};

export default InMemory;
