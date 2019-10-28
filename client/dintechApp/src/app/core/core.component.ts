import { OnInit, Component } from '@angular/core';

@Component({
    selector: 'app-core',
    templateUrl: './core.component.html',
    styleUrls: ['./core.component.scss'],
  })
  export class CoreComponent implements OnInit {
  
    showNav: boolean = false;
    navText: string = "Menu";
    mobile: boolean;
    scrolled: boolean = false;
  
    constructor() { }
  
    ngOnInit() {

    }
  
  }