import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewComponent } from './pages/view/view.component';

const routes: Routes = [
    {
        path: '',
        component: ViewComponent,
        data: {title: "Home"}
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class WatchRoutingModule { }