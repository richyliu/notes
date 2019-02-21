import { Database, Note, Id, Tag } from '../database';

interface InternalNote {
  note: Note;
  tags: Tag[];
}

let notes: { [key: string]: InternalNote } = {
  foo: {
    note: { content: 'bar baz\n\nhello world' },
    tags: [{ tag: 'foo' }, { tag: 'bar' }],
  },
  ImwmPGfDkl: {
    note: { content: '# foo\nbar baz more text' },
    tags: [{ tag: 'foo' }],
  },
};

const InMemory: Database = {
  async isNote(id: Id) {
    return Boolean(id in notes);
  },
  async getNote(id: Id) {
    if (await this.isNote(id)) return notes[id].note;
    else return { msg: `Note id: ${id} does not exist.` };
  },
  async setNote(id: Id, note: Note) {
    notes[id].note = note;
    return undefined;
  },
  async addNote(note: string) {
    if (Math.random() < 0.3) {
      return { msg: 'Failed to add note (randomly generated error)' };
    }
    const id = (Math.random() + '').slice(2);
    await this.setNote(id, note);
    return id;
  },
  async getTags(id: Id) {
    return [{ tag: 'foo' }, { tag: 'bar' }, { tag: 'test' }];
  },
  async getAllTags() {
    return [{ tag: 'foo' }, { tag: 'bar' }, { tag: 'test' }];
  },
  async getNotesByTags(tags: Tag[]) {
    return await this.getNote('foo');
  },
};

export default InMemory;
