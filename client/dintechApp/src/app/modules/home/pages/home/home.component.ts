import { Component, OnInit } from '@angular/core';
import { NewSessionService } from 'src/app/shared/services/newsession.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private newSessionService: NewSessionService) { }

  ngOnInit() {
  }

}
