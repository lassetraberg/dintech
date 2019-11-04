import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { SignupComponent } from './pages/signup/signup.component';

@NgModule({
    declarations: [
        SignupComponent,
    ],
    imports: [ 
        CommonModule,
        AuthRoutingModule,
        SharedModule
    ],
    providers: []
  })
  export class AuthModule { }