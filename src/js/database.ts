export type Note = string;
export type Error = string;

/**
 * Standard database interface for loading and saving notes
 */
export interface Database {
  /* Checks if note exists in database */
  isNote(id: string): Promise<boolean>;
  /* Get the note with id or returns Error */
  getNote(id: string): Promise<Note | [Note, Error]>;
  /* Set the note, undefined on success or Error */
  setNote(id: string, note: Note): Promise<Error | undefined>;
  /* Add a note returning id or Error */
  addNote(note: string): Promise<string | [string, Error]>;
}

export default function setup(
  send: (content: {type_: string; data: string[]}) => void,
  subscribe: (cb: (content: {type_: string; data: string[]}) => void) => void,
  db: Database,
) {
  subscribe(({type_, data}) => {
    const data0 = data[0];
    switch (type_) {
      case 'GetNote':
        db.getNote(data0).then(note => {
          if (typeof note === 'string') send({type_: 'GetNote', data: [note]});
          else send({type_: 'GetNote', data: note});
        });
        break;
      case 'UpdateNote':
        db.setNote(data0, data[1]).then(() =>
          send({type_: 'UpdateNote', data: ['Successfully updated note!']}),
        );
        break;
      case 'IsNote':
        db.isNote(data0).then(itIs =>
          send({type_: 'IsNote', data: [itIs ? 'yes' : '']}),
        );
      case 'AddNote':
        db.addNote(data0).then(id => {
          if (typeof id === 'string') send({type_: 'AddNote', data: [id]});
          else send({type_: 'AddNote', data: id});
        });
      default:
        console.log('[js]: unknown type_: ' + type_);
        break;
    }
  });
}
