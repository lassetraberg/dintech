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

@NgModule({
  declarations: [
    ButtonComponent,
    ChatComponent,
    NewsessionComponent
  ],
  imports: [
    OverlayModule,  
    CommonModule,
    FormsModule
  ],
  providers: [
      PlayPauseService,
      ChatService,
      NewSessionService
  ],
  exports: [
      ButtonComponent,
      ChatComponent,
      FormsModule
  ],
  entryComponents: [
    ChatComponent,
    NewsessionComponent
  ]
})
export class SharedModule { }
