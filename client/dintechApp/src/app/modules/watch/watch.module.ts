import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ViewComponent } from './pages/view/view.component';
import { WatchRoutingModule } from './watch-routing.module';

@NgModule({
    declarations: [
        ViewComponent,
    ],
    imports: [ 
        CommonModule,
        WatchRoutingModule,
        SharedModule
    ],
    providers: []
  })
  export class WatchModule { }