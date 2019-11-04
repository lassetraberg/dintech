import { NgModule } from '@angular/core';
import { ButtonComponent } from './components/button/button.component';
import { PlayPauseService } from './services/playpause.service';
import { ChatComponent } from './components/chat/chat.component';
import { ChatService } from './services/chat.service';
import { OverlayModule } from '@angular/cdk/overlay';
import { NewsessionComponent } from './components/newsession/newsession.component';
import { NewSessionService } from './services/newsession.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from './services/data.service';
import { WebsocketService } from './services/websocket.service';
import { AuthGuard } from './guards/auth.guard';
import { JoinSessionService } from './services/joinsession.service';
import { JoinsessionComponent } from './components/joinsession/joinession.component';

@NgModule({
  declarations: [
    ButtonComponent,
    ChatComponent,
    NewsessionComponent,
    JoinsessionComponent
  ],
  imports: [
    OverlayModule,  
    CommonModule,
    FormsModule
  ],
  providers: [
      PlayPauseService,
      ChatService,
      NewSessionService,
      JoinSessionService,
      DataService,
      WebsocketService,
      AuthGuard
  ],
  exports: [
      ButtonComponent,
      ChatComponent,
      FormsModule
  ],
  entryComponents: [
    ChatComponent,
    NewsessionComponent,
    JoinsessionComponent
  ]
})
export class SharedModule { }
