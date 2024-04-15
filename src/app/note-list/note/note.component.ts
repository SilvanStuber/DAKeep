import { Component, Input } from '@angular/core';
import { Note } from '../../interfaces/note.interface';
import { NoteListService } from '../../firebase-services/note-list.service';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
})
export class NoteComponent {
  @Input() note!: Note;
  edit = false;
  hovered = false;

  constructor(private noteService: NoteListService) {}

  changeMarkedStatus() {
    this.note.marked = !this.note.marked;
    this.saveNote();
  }

  deleteHovered() {
    if (!this.edit) {
      this.hovered = false;
    }
  }

  openEdit() {
    this.edit = true;
  }

  closeEdit() {
    this.edit = false;
    this.saveNote();
  }

  moveToTrash() {
    if (this.note.id) {
      this.note.type = 'trash'; //note typ ändern wir in trash
      let docId = this.note.id; //hier übergeben wir die documenten id
      delete this.note.id; // hiermit löschen wir nicht nur den Inhalt auch die document Id
      this.noteService.addNote(this.note, 'trash'); //speichern den Inhalt unter der collection trash
      this.noteService.deleteNote('notes', docId); //löschen die inhalte in der collection notes
    }
  }

  moveToNotes() {
    if (this.note.id) {
      this.note.type = 'note';; //note typ ändern wir in note
      let docId = this.note.id; //hier übergeben wir die documenten id
      delete this.note.id; // hiermit löschen wir nicht nur den Inhalt auch die document Id
      this.noteService.addNote(this.note, 'notes'); //speichern den Inhalt unter der collection notes
      this.noteService.deleteNote('trash', docId); //löschen die inhalte in der collection trash
    }
  }

  deleteNote() {
    if (this.note.id) {
      this.noteService.deleteNote('trash', this.note.id); //löschen die inhalte in der collection trash
    }
  }

  saveNote() {
    this.noteService.updateNote(this.note);
  }
}
