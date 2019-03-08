import { Database, Note, Id, Tag } from '../database';
import * as PouchDB from 'pouchdb';

let notes: { [key: string]: Note } = {
  xyus23ei: {
    content: 'bar baz\n\nhello world',
    id: 'xyus23ei',
    title: 'Bar baz',
    tags: ['@All', 'foo', 'bar', 'baz'],
  },
  ImwmPGfDkl: {
    content: '# foo\nbar baz more text lmao what a troll',
    id: 'ImwmPGfDkl',
    title: 'The foo',
    tags: ['@All', 'foo'],
  },
  yrstr: {
    content: '# foo\nbar baz more text',
    id: 'yrstr',
    title: 'Foo bar',
    tags: ['@All'],
  },
};
// for debug purposes
window['notes'] = notes;

const Pouch: Database = {
  async isNote(id: Id) {
    return Boolean(id in notes);
  },
  async getNote(id: Id) {
    if (await this.isNote(id)) return notes[id];
    else return { msg: `Note id: ${id} does not exist.` };
  },
  async setNote(id: Id, note: Note) {
    notes[id] = note;
    return undefined;
  },
  async addNote(note: Note) {
    if (Math.random() < 0.3) {
      return { msg: 'Failed to add note (randomly generated error)' };
    }
    const id = (Math.random() + '').slice(2);
    await this.setNote(id, note);
    return id;
  },
  async getTags(id: Id) {
    if (await this.isNote(id)) return [...new Set(notes[id].tags)];
    else return { msg: `Note id: "${id}" does not exist.` };
  },
  async getAllTags() {
    return [...new Set(Object.values(notes).flat())];
  },
  async getNotesByTags(tags: Tag[]) {
    return Object.values(notes).filter(note =>
      tags.some(tag => note.tags.includes(tag))
    );
  },
  async startup() {},
};

export default Pouch;
