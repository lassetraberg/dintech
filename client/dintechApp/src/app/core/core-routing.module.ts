import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
const routes: Routes = [
    {
        path: '',
        loadChildren: "../modules/home/home.module#HomeModule"
    },
    {
        path: 'watch/:id',
        loadChildren: "../modules/watch/watch.module#WatchModule"
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