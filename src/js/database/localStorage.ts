import { Database, Note, Id, Tag, isError } from '../database';

const getItem = (key: string) =>
  JSON.parse(localStorage.getItem(lsPrefix + key));
const setItem = (key: string, item: object) =>
  localStorage.setItem(lsPrefix + key, JSON.stringify(item));

const lsPrefix = 'notes_elm_stored_';
const allNotes = 'ALL_NOTES';

const LocalStorage: Database = {
  async isNote(id: string) {
    return Boolean(getItem(id));
  },
  async getNote(id: string) {
    if (await this.isNote(id)) return getItem(id) as Note;
    else return { msg: `Note id: ${id} does not exist.` };
  },
  async setNote(id: string, note: Note) {
    const oldNote = await this.getNote(id);
    if (note.id !== oldNote.id)
      return { msg: `Cannot change the id of note with id: ${id}` };
    setItem(id, { ...oldNote, ...note });
    return undefined;
  },
  async addNote(note: string) {
    const id = (Math.random() + '').slice(2);
    await this.setNote(id, note);
    const currentNotes = [...(getItem(allNotes) as Id[]), id];
    setItem(allNotes, currentNotes);
    return id;
  },
  async getTags(id: Id) {
    if (await this.isNote(id)) return (getItem(id) as Note).tags;
    else return { msg: `Note id: "${id}" does not exist.` };
  },
  async getAllTags() {
    const notes: Note[] = (await Promise.all(
      (getItem(allNotes) as Id[]).map(id => this.getNote(id))
    )).filter(n => !isError(n));

    const tags: Tag[][] = (await Promise.all(
      notes.map(n => this.getTags(n.id))
    )).filter(n => !isError(n));

    return [...new Set(tags.flat())];
  },
  async getNotesByTags(tags: Tag[]) {
    let notes = (await Promise.all(
      (getItem(allNotes) as Id[]).map(id => this.getNote(id))
    )).filter(n => !isError(n));

    return notes.filter(note => tags.some(tag => note.tags.includes(tag)));
  },
  async setup() {
    return;
    let initialNotes: Note[] = [
      {
        content: 'bar baz\n\nhello world',
        id: 'xyus23ei',
        title: 'Bar baz',
        tags: ['@All', 'foo', 'bar', 'baz'],
      },
      {
        content: '# foo\nbar baz more text lmao what a troll',
        id: 'ImwmPGfDkl',
        title: 'The foo',
        tags: ['@All', 'foo'],
      },
      {
        content: '# foo\nbar baz more text',
        id: 'yrstr',
        title: 'Foo bar',
        tags: ['@All'],
      },
    ];

    setItem(allNotes, initialNotes.map(n => n.id));
    initialNotes.forEach(n => setItem(n.id, n));
    console.log('[js]: Set up localStorage database with new data');
  },
};

export default LocalStorage;
