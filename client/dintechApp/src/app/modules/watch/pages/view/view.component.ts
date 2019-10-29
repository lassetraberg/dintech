import { Component, OnInit, AfterViewInit, } from '@angular/core';
import { PlayPauseService } from 'src/app/shared/services/playpause.service';
import { ChatService } from 'src/app/shared/services/chat.service';
import { Router, ActivatedRoute } from '@angular/router';
import { WebsocketService } from 'src/app/shared/services/websocket.service';
import { WebSocketSubject } from 'rxjs/webSocket';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit, AfterViewInit {

  // Reference to YouTube Player.
  player: any;
  playing: boolean;
  sessionId: string;
  ytUrl: string = null;


  // Websockets
  private socket: WebSocketSubject<any>;

  constructor(private playpause: PlayPauseService,  private chat : ChatService, private aRouter: ActivatedRoute, private ws: WebsocketService) { }
  
  ngOnInit() {
    this.sessionId = this.aRouter.snapshot.paramMap.get('id');
    if(window.sessionStorage.getItem('username') == null){
      // TODO: Make nice UI
      var username = prompt('Enter a username');
      if (username != null) {
        window.sessionStorage.setItem('username', username);
        this.subscribeToWebsockets();
      }
    } else {
      this.subscribeToWebsockets();
    }

    // Subscribe to external (outside of this component) state changes.
      this.playpause.state.subscribe({
      next: (data) => console.log(data)
    });
  }
  
  ngAfterViewInit(): void {
    // Load YouTube IFrame API Script.
    const doc = (<any>window).document;
    let iframeAPI = doc.createElement('script');
    iframeAPI.type = 'text/javascript';
    iframeAPI.src = 'https://www.youtube.com/iframe_api';
    doc.body.appendChild(iframeAPI);
  }

  subscribeToWebsockets(){
     // Subscribe to WebSocket
     this.socket = this.ws.getSubject(this.sessionId, sessionStorage.getItem("username"));
     this.socket.subscribe(
       message => {
         console.log(message);
         if(this.ytUrl == null){
           this.ytUrl = message.ytUrl;
           this.initialiseYt();
         }
         if(message.command) {
           if(message.command == 'play') {
             this.player.playVideo();
           }
           if(message.command == 'pause') {
             this.player.pauseVideo();
             this.player.seekTo(message.offsetFromStart, true);
           } 
         }
       },
       error => console.log(error),
       () => console.log('complete')
     );
  }

  initialiseYt(){
    // Initialise YouTube Player.
    (<any>window).onYouTubeIframeAPIReady = () => {
      this.player = new (<any>window).YT.Player('yt-player', {
        height: '100%',
        width: '100%',
        videoId: this.ytUrl.split('\=')[1],
        playerVars: {'autoplay': 0, 'rel': 0, 'controls': 0},
        events: {
          'onReady': (data) => {
            this.onPlayerReady();
          },
          'onStateChange': (data) => {
            this.onPlayerStateChange(data);
          }
        }
      });
    };    
    console.log("Done!");
  }

  // The API calls this function when the video player is ready.
  onPlayerReady() {
    console.log("Player Ready");
    //this.player.playVideo();
  }

  /**
   * The API calls this function when the video player is ready. 
   * -1 - unstarted
   * 0 - ended
   * 1 - playing
   * 2 - paused
   * 3 - buffering
   * 5 - video cued
   */ 
  onPlayerStateChange(event: any) {
    console.log(event);    
  }

  openChat() {
    this.chat.open();
  }

  playPause() {
    this.playing = !this.playing;
    if(this.playing) {
      this.socket.next({command: 'play'});
    } else {
      this.socket.next({command: 'pause', offsetFromStart: this.player.getCurrentTime()});
    }
  }

}
