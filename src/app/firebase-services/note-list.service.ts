import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface'
import { Firestore, collection, doc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];

  items$;
  items;

  firestore: Firestore = inject(Firestore);

  constructor() { 
    this.items$ = collectionData(this.getNotesRef());//import der Daten
    this.items = this.items$.subscribe((list) => { //subscriben der Daten
      list.forEach(element => {
        console.log(element) //mit der forEach greifen wir auf die einzelnen Elemenete zu.
      });
    } )
    this.items.unsubscribe();//am Schluss beenden wir die subscribe gute Sache für unser Memory
  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getSingleDocRef(colId:string, docId:string) {
    return doc(collection(this.firestore, colId), docId);
  }
}
