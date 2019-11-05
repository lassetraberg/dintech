import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  ViewChild
} from "@angular/core";
import { Form, FormGroup, FormControl } from "@angular/forms";
import { trigger, transition, style, animate } from "@angular/animations";
import { DataService } from "../../services/data.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-joinsession",
  templateUrl: "./joinsession.component.html",
  styleUrls: ["./joinsession.component.scss"],
  animations: [
    trigger("slideIn", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateX(100%)" }),
        animate(
          "200ms cubic-bezier(.25,.8,.25,1)",
          style({ opacity: 1, transform: "translateX(0)" })
        )
      ]),
      transition(":leave", [
        animate("200ms cubic-bezier(.25,.8,.25,1)", style({ opacity: 0 }))
      ])
    ])
  ]
})
export class JoinsessionComponent implements OnInit {
  @Output() close: EventEmitter<void> = new EventEmitter();

  // Form
  sessionForm: FormGroup;
  submitted: boolean = false;
  model = new SessionData();

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit() {}

  _close() {
    this.close.next();
  }

  onSubmit(form: Form) {
    this.submitted = true;
    this.router.navigate(["/watch/" + this.model.id]);
    this._close();
  }

  get diagnostic() {
    return JSON.stringify(this.model);
  }
}

// Model for input validation
class SessionData {
  constructor(public id?: string) {}
}
