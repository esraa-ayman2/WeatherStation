import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  standalone: true,
  template: '',
})
class RouteMarkerComponent {}

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'forecast' },
  { path: 'forecast', component: RouteMarkerComponent },
  { path: 'news', component: RouteMarkerComponent },
  { path: 'photos', component: RouteMarkerComponent },
  { path: 'contact', component: RouteMarkerComponent },
  { path: '404', component: RouteMarkerComponent },
  { path: '**', redirectTo: '404' },
];
