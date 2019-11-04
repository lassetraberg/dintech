import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (window.sessionStorage.getItem('username') != null) {
      return true;
    } else {
      this.router.navigate(['auth'], {
        queryParams: {
          return: state.url
        }
      });
      return false;
    }
  }
}