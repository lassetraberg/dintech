import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/guards/auth.guard';
const routes: Routes = [
    {
        path: '',
        loadChildren: "../modules/home/home.module#HomeModule"
    },
    {
        path: 'watch/:id',
        loadChildren: "../modules/watch/watch.module#WatchModule",
        canActivate: [AuthGuard]
    },
    {
        path: 'auth',
        loadChildren: "../modules/auth/auth.module#AuthModule"
    },
    {
        path: '**',
        redirectTo: '',
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class CoreRoutingModule { }