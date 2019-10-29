import { OnInit, Component } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

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
  
    constructor(private router: Router) { }
  
    ngOnInit() {
      // Clear username on refresh.
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          window.sessionStorage.clear();
        }
      });

    }
  
  }