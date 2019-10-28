import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { Form, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-newsession',
  templateUrl: './newsession.component.html',
  styleUrls: ['./newsession.component.scss']
})
export class NewsessionComponent implements OnInit {

  
  @Output() close: EventEmitter<void> = new EventEmitter();

  // Form
  rights = ['Everyone can control', 'Only I can control'];
  submitted: boolean = false;
  model = new SessionData();

  constructor() { }

  ngOnInit() {

  }

  _close(){
    this.close.next();
  }

  newSession() {
    
  }

  onSubmit(form: Form) {
    this.submitted = true;
  }

}

// Model for input validation
class SessionData {
  constructor(
    public link?: string,
    public name?: string,
    public rights?: string,
  ) {  }

}
