export type Id = string;
// Can only contain the following: a-z, A-Z, 0-9, _, /
export type Tag = string;
export interface Note {
  content: string;
  id: Id;
  title: string;
  tags: Tag[];
}
export interface Error {
  msg: string;
}

export function isError(obj: any): obj is Error {
  return 'msg' in obj;
}

/**
 * Standard database interface for loading and saving notes
 */
export interface Database {
  /* Checks if note exists in database */
  isNote(id: Id): Promise<boolean | Error>;
  /* Get the note with id or returns Error */
  getNote(id: Id): Promise<Note | Error>;
  /* Set the note, undefined on success or Error */
  setNote(id: Id, note: Note): Promise<Error | void>;
  /* Add a note returning id or Error */
  addNote(note: Note): Promise<Id | Error>;
  /* Get tags for a given note id */
  getTags(id: string): Promise<Tag[] | Error>;
  /* Get all the tags */
  getAllTags(): Promise<Tag[] | Error>;
  /* Get notes */
  getNotesByTags(tags: Tag[]): Promise<Note[] | Error>;
  /* Setup the database */
  setup?(): Promise<void>;
}

interface ElmMsg {
  type_: string;
  datatype: string;
  data: string[];
}

export default async function setup(
  sendIn: (content: ElmMsg) => void,
  subscribe: (cb: (content: ElmMsg) => void) => void,
  db: Database,
  runSetup = false
) {
  if (runSetup && 'setup' in db) await db.setup();

  const send = (t, dt, d) => sendIn({ type_: t, datatype: dt, data: d });

  subscribe(({ type_, data }) => {
    const data0 = data[0];
    switch (type_) {
      case 'GetNote':
        db.getNote(data0).then(note => {
          if (isError(note)) send('GetNote', 'error', [note.msg]);
          else {
            db.getTags(data0).then(tags => {
              if (isError(tags)) send('GetNote', '', [tags.msg]);
              else send('GetNote', '', [formatFullNote(note, tags)]);
            });
          }
        });
        break;

      case 'UpdateNote':
        db.setNote(data0, {
          content: data[3],
          id: data0,
          title: data[1],
          tags: data[2].split(','),
        }).then(err => {
          if (err) send('UpdateNote', 'error', [err.msg]);
          else send('UpdateNote', 'message', ['Successfully updated note!']);
        });
        break;

      case 'IsNote':
        db.isNote(data0).then(itIs => {
          if (isError(itIs))
            send('IsNote', 'error', ['Unable to check if id is a note']);
          else send('IsNote', '', [itIs ? 'yes' : '']);
        });
        break;

      case 'AddNote':
        const note = unFormatFullNote(data0);
        if (isError(note)) send('AddNote', 'error', [note.msg]);
        else
          db.addNote(note).then(id => {
            if (isError(id)) send('AddNote', 'error', [id.msg]);
            else send('AddNote', '', [id]);
          });
        break;

      case 'GetTags':
        db.getTags(data0).then(tags => {
          if (isError(tags)) send('GetTags', 'error', [tags.msg]);
          else send('GetTags', '', tags);
        });
        break;

      case 'GetAllTags':
        db.getAllTags().then(tags => {
          if (isError(tags)) send('GetAllTags', 'error', [tags.msg]);
          else send('GetAllTags', '', tags);
        });
        break;

      case 'GetNotesByTags':
        db.getNotesByTags(data).then(notes => {
          if (isError(notes)) send('GetNotesByTags', 'error', [notes.msg]);
          else {
            Promise.all(notes.map(note => db.getTags(note.id))).then(
              notesTags => {
                for (let error of notesTags) {
                  if (isError(error)) {
                    send('GetNotesByTags', 'error', [error.msg]);
                    return;
                  }
                }
                send(
                  'GetNotesByTags',
                  '',
                  notes.map((note, i) =>
                    formatFullNote(note, notesTags[i] as Tag[])
                  )
                );
              }
            );
          }
        });
        break;

      default:
        console.warn(`[js]: unknown type_: ${type_} with data:`, data);
        break;
    }
  });
}

/**
 * Embeds id and tag info into a note's header
 */
function formatFullNote(note: Note, tags: Tag[]): string {
  return `---
id: ${note.id}
tags: ${tags.join(',')}
title: ${note.title}
---
${note.content}`;
}

/**
 * Get the note from a formatted note string
 */
function unFormatFullNote(note: string): Note | Error {
  const lines = note.split('\n');
  if (note.length < 6) return { msg: `Incorrectly formatted note: ${note}` };

  return {
    id: lines[1].slice(4),
    tags: lines[2].slice(6).split(','),
    title: lines[3].slice(7),
    content: lines.slice(5).join('\n'),
  };
}
