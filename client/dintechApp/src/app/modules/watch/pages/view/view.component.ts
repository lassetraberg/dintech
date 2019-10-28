import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, HostListener } from '@angular/core';
import { PlayPauseService } from 'src/app/shared/services/playpause.service';
import { timer } from 'rxjs';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit, AfterViewInit {

  // Reference to YouTube Player.
  player: any;
  
  constructor(private playpause: PlayPauseService) { }
  
  ngOnInit() {

    // Initialise YouTube Player.
    (<any>window).onYouTubeIframeAPIReady = () => {
      this.player = new (<any>window).YT.Player('yt-player', {
        height: window.innerHeight,
        width: '100%',
        videoId: 'r5dHD8MpSpU',
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

  // The API calls this function when the video player is ready.
  onPlayerReady() {
    console.log("Player Ready");
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

}