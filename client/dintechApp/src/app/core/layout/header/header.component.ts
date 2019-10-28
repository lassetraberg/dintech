import { Component, OnInit, HostListener } from '@angular/core';
import { ChatService } from 'src/app/shared/services/chat.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private chat : ChatService) { }

  ngOnInit() {
  }

  openChat() {
    this.chat.open();
  }

}
