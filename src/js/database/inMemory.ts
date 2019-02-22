import { Database, Note, Id, Tag } from '../database';

interface InternalNote {
  note: Note;
  tags: Tag[];
}

let notes: { [key: string]: InternalNote } = {
  xyus23ei: {
    note: { content: 'bar baz\n\nhello world', id: 'xyus23ei' },
    tags: [{ tag: '@All' }, { tag: 'foo' }, { tag: 'bar' }, { tag: 'baz' }],
  },
  ImwmPGfDkl: {
    note: { content: '# foo\nbar baz more text', id: 'ImwmPGfDkl' },
    tags: [{ tag: '@All' }, { tag: 'foo' }],
  },
  yrstr: {
    note: { content: '# foo\nbar baz more text', id: 'yrstr' },
    tags: [{ tag: '@All' }],
  },
};
window['notes'] = notes;

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
    if (await this.isNote(id))
      return [...new Set(notes[id].tags.map(tag => tag.tag))].map(tag => ({
        tag,
      }));
    else return { msg: `Note id: "${id}" does not exist.` };
  },
  async getAllTags() {
    return [
      ...new Set(
        Object.values(notes).flatMap(note => note.tags.map(tag => tag.tag))
      ),
    ].map(tag => ({ tag }));
  },
  async getNotesByTags(tags: Tag[]) {
    return Object.values(notes)
      .filter(note =>
        tags.some(tag => note.tags.map(t => t.tag).includes(tag.tag))
      )
      .map(note => note.note);
  },
};

export default InMemory;
