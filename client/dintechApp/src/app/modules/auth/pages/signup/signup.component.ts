import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  return: string = '';

  // Form
  sessionForm: FormGroup;
  submitted: boolean = false;
  model = new SignUpData();

  constructor( private router: Router,
    private route: ActivatedRoute,) { }

  ngOnInit() {
    this.route.queryParams.subscribe(
      params => (this.return = params["return"] || "/")
    );
  }

  submit() {
    // Check if username already exists
    window.sessionStorage.setItem('username', this.model.name);
    this.router.navigate([this.return]);
  }

}

// Model for input validation
class SignUpData {
  constructor(
    public name?: string,
  ) {  }
}
