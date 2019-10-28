import { Component, OnInit } from '@angular/core';
import { PlayPauseService } from 'src/app/shared/services/playpause.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {

  playing: boolean;

  constructor(private playpause: PlayPauseService) { }

  ngOnInit() {
  }

  public playPause(): void {
    this.playpause.play();
    this.playing = !this.playing;
  }

}
