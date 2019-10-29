import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreComponent } from './core.component';
import { CoreRoutingModule } from './core-routing.module';
import { HeaderComponent } from './layout/header/header.component';
import { SharedModule } from '../shared/shared.module';
import { TimelineComponent } from './layout/timeline/timeline.component';
import { FormsModule }   from '@angular/forms';
import { BrowserAnimationsModule }   from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
    declarations: [
        CoreComponent,
        HeaderComponent,
        TimelineComponent,
    ],
    imports: [
      CommonModule,
      CoreRoutingModule,
      SharedModule,
      FormsModule,
      BrowserAnimationsModule,
      HttpClientModule, 
    ],
    providers: []
  })
  export class CoreModule { }