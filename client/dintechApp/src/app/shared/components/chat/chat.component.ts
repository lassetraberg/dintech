import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('200ms cubic-bezier(.25,.8,.25,1)', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(.25,.8,.25,1)', style({ opacity: 0 }))
      ])
    ]),
  ]
})
export class ChatComponent implements OnInit {
  
  @Output() close: EventEmitter<void> = new EventEmitter();
  

  constructor() { }

  ngOnInit() {
  }

  _close(){
    this.close.next();
  }

}
