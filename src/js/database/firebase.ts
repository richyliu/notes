import { Database, Note, Id, Tag, isError } from '../database';

const LocalStorage: Database = {
  async isNote(id: string) {
    return false;
  },
  async getNote(id: string) {
    return { msg: `Unimplemented` };
  },
  async setNote(id: string, note: Note) {
    return { msg: `Unimplemented` };
  },
  async addNote(note: Note) {
    return { msg: `Unimplemented` };
  },
  async getTags(id: Id) {
    return { msg: `Unimplemented` };
  },
  async getAllTags() {
    return { msg: `Unimplemented` };
  },
  async getNotesByTags(tags: Tag[]) {
    return { msg: `Unimplemented` };
  },
  async setup() {},
  async startup() {},
};

export default LocalStorage;
