import { useState, useEffect, useReducer } from 'react';

import createContainer from 'constate';

import { Tag } from './tags';
import { NoteInfo } from './notes';
import lsdb from '../database/localStorageDb';

interface INotesViewState {
  tags?: Tag[];
  notes?: NoteInfo[];
  activeTag?: Tag;
  activeNote?: NoteInfo;
}

export type INotesViewActions = 'activeTag' | 'activeNote' | 'notes' | 'tags';

interface INotesViewAction {
  action: INotesViewActions;
  payload: INotesViewState[keyof INotesViewState];
}

const NotesViewState = createContainer(() =>
  useReducer<INotesViewState, INotesViewAction>((state, action) => {
    switch (action.action) {
      case 'tags':
        return {
          ...state,
          tags: action.payload as Tag[],
          activeTag: (action.payload as Tag[])[0],
        };
      case 'notes':
        return {
          ...state,
          notes: action.payload as NoteInfo[],
          activeNote: (action.payload as NoteInfo[])[0],
        };
      default:
        return {
          ...state,
          [action.action]: action.payload,
        };
    }
  }, {})
);

export default NotesViewState;
