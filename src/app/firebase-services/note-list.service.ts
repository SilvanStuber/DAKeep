import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NoteListService {
  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];

  unsubTrash;
  unsubNotes;
  unsubMarkedNotes;

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubTrash = this.subTrashList();
    this.unsubNotes = this.subNotesList();
    this.unsubMarkedNotes = this.subMarkedNotesList();
  }

  async addNote(item: Note, colId: 'notes' | 'trash') {
    let refFunction: any;
    if (colId == 'notes') {
      refFunction = this.getNotesRef(); //wenn die collection id notes ist in notes speichern
    } else if (colId == 'trash') {
      refFunction = this.getTrashRef(); //wenn die collection id trash ist in trash speichern
    }
    await addDoc(refFunction, item) //hier fügen wir der Datenbank den Inhalt welcher beim Aufruf der Funktion übergeben hinzu
      .catch((err) => {
        //hier legen wir fest wenn etwas nicht funktioniert wie er vorgehen soll
        console.error(err);
      })
      .then((docRef) => {
        //zusätzlich logen wir die id in der Console
        console.log('Document written with ID:', docRef?.id);
      });
  }

  async updateNote(note: Note) {
    if (note.id) {
      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
      await updateDoc(docRef, this.getCleanJson(note)).catch((err) => {
        console.log(err);
      }); // hier an der stelle macht das then kein sinn
    }
  }

  getCleanJson(note: Note): {} {
    //mit :{} definieren wir das wir ein JSON returnen
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    };
  }

  getColIdFromNote(note: Note) {
    if (note.type == 'note') {
      return 'notes';
    } else {
      //hier übersetzen wir das wir den richtigen collection Id haben
      return 'trash';
    }
  }

  async deleteNote(colId: string, docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch((err) => {
      console.log(err); //console.log nur für entwicklung später funktion einfügen evtl anschliessend ein then einfügen
    }); //hier muss mann nur deklarieren wass gelösch werden muss
    //und übergeben die collection id und document id welche sich
    //in der collection befindet
  }

  ngonDestroy() {
    this.unsubTrash();
    this.unsubNotes();
    this.unsubMarkedNotes;
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach((element) => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subNotesList() {
    const q = query(this.getNotesRef(), orderBy("title"), limit(100));
    return onSnapshot(q, (list) => {                                          
      this.normalNotes = [];
      list.forEach((element) => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subMarkedNotesList() {
    const q = query(this.getNotesRef(), where("marked", "==", true), limit(100));
    return onSnapshot(q, (list) => {                                          
      this.normalMarkedNotes = [];
      list.forEach((element) => {
        this.normalMarkedNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id,
      type: obj.type || 'note',
      title: obj.title || '',
      content: obj.content || '',
      marked: obj.marked || false,
    };
  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}
