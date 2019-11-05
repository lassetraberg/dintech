import { Component, OnInit, AfterViewInit, ViewChild, AfterContentChecked, AfterViewChecked, ElementRef, ChangeDetectorRef, } from '@angular/core';
import { ChatService } from 'src/app/shared/services/chat.service';
import { Router, ActivatedRoute, RouterStateSnapshot } from '@angular/router';
import { WebsocketService } from 'src/app/shared/services/websocket.service';
import { WebSocketSubject } from 'rxjs/webSocket';
import { timer, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit, AfterViewInit {

  // Reference to YouTube Player
  player: any;
  playing: boolean = false;
  sessionId: string;
  ytUrl: string = null;
  usernames: string[] = null;

  // Commands
  lateJoinState: any;
  
  // Timeline
  currentTime : number;
  @ViewChild('slider', {static: false}) slider: ElementRef;
  subscription: Subscription;

  // Websockets
  private socket: WebSocketSubject<any>;

  constructor(private cdr: ChangeDetectorRef, private chat : ChatService, private router: Router, private aRouter: ActivatedRoute, private ws: WebsocketService) { }
  
  ngOnInit() {
    this.sessionId = this.aRouter.snapshot.paramMap.get('id');
    this.subscribeToWebsockets();
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
    const actions = {
      play: (arg) => { this.play() },
      pause: (arg) => { this.pause(arg) },
      seekTo: (arg) => { this.seekTo(arg) },
      requestState: (arg) => { this.requestState(arg) },
      setState: (arg) => { this.setState(arg) },
    }
    const errors = {
      'NO_SESSION': () => { this.errorMethod() },
      'NO_USERNAME': () => { this.errorMethod() },
      'USERNAME_IN_USE': () => { this.errorMethod() },
      'INVALID_COMMAND': () => { this.errorMethod() },
    }
    
     // Subscribe to WebSocket
     this.socket = this.ws.getSubject(this.sessionId, sessionStorage.getItem("username"));
     this.socket.subscribe(
       message => {
         console.log(message);
        if(message.error) {
          const error = errors[message.error.errorCode];
          if (!error) return;
          error();
        } else if (this.ytUrl == null){
          this.ytUrl = message.ytUrl;
          this.usernames = message.usernames;
          this.initialiseYt();
        } else {
          const state = actions[message.command];
          if (!state) return;
          state(message); 
        }
       },
       error => console.log(error),
       () => console.log('complete')
     );
  }

  errorMethod() {
    console.log("Error method");
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
  }

  // The API calls this function when the video player is ready.
  onPlayerReady() {
    if (this.lateJoinState) {
      this.player.pauseVideo();
      const {offset, isPlaying} = this.lateJoinState;
      if (Math.floor(offset) > 0) this.player.seekTo(offset, true);
      if (isPlaying) this.player.playVideo();
      else this.player.pauseVideo();
      this.lateJoinState = null; 
    }
  }

  /**
   * The API calls this function when the video player state changes. 
   * -1 - unstarted
   * 0 - ended
   * 1 - playing
   * 2 - paused
   * 3 - buffering
   * 5 - video cued
   */ 
  onPlayerStateChange(event: any) {
    // Clear subscription
    console.log(event.data);
    if(this.subscription) this.subscription.unsubscribe();
    const states = {
      '-1': () => {
        this.playing = false;
      },
      0: () => {
        this.playing = false;
      },
      1: () => {
        this.syncTimeline()
        this.playing = true;
      },
      2: () => {
        this.playing = false;
      },
      3: () => {
        this.playing = false;
      },
      5: () => {
        this.playing = false;
      }
      

    }
    const state = states[event.data];
    if (!state) return;
    state();
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  play() {
    this.player.playVideo();
  }

  playPause() {
    if(!this.playing) {
      this.socket.next({command: 'play'});
    } else {
      this.socket.next({command: 'pause', offset: this.player.getCurrentTime()});
    }
  }

  /**
   * Invoke function to track video elapsed time.
   * Pre-condition: Player has state '1'.
   */
  syncTimeline() {
    if(this.slider) {
      this.subscription = timer(0, 500).subscribe( () => {
        // Get video status
        const duration = this.player.getDuration();
        const currentTime = this.player.getCurrentTime();
        // Set input range properties to match video status
        this.slider.nativeElement.max = duration;
        this.slider.nativeElement.value = "" + currentTime;
        // Make left side of input thumb darker (elapsed time)
        const percentage = currentTime / duration * 100;
        this.slider.nativeElement.style.background = 'linear-gradient(to right, rgb(60,58,60) 0%, rgb(60,58,60) '+ percentage +'%, rgb(228,183,153) ' + percentage + '%, rgb(228,183,153) 100%)';
      });
    }
  }

  pause(arg) {
    const offset = arg.offset;
    this.player.pauseVideo();
    this.player.seekTo(offset);
  }

  seekTo(arg) {
    const {offset} = arg;
    this.player.seekTo(offset, true); 
  }

  requestState(arg) {
    const offset = this.player.getCurrentTime();
    const isPlaying = this.playing;
    this.socket.next({command: 'setState', state: {isPlaying, offset}});
  }

  setState(arg) {
    if (this.player) {
      this.player.pauseVideo();
      const {offset, isPlaying} = arg;
      if (Math.floor(offset) > 0) this.player.seekTo(offset, true);
      if (isPlaying) this.player.playVideo();
      else this.player.pauseVideo();
    } else {
      this.lateJoinState = arg;
    }
  }

  /**
   * Method to request seek to a given number of seconds.
   * @param seconds elapsed time.
   */
  postSeekTo(seconds: number) {
    this.socket.next({command: 'seekTo', offset: seconds});
  }
  





















  openChat() {
    this.chat.open();
  }




}

class YouTubeVideo {
  constructor(
    public currentTime?: number,
    public duration?: number,
  ) {  }

}
