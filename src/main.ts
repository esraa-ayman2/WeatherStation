import '@angular/compiler';
import './index.css';
import 'zone.js';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';

@Component({
	standalone: true,
	template: '',
})
class RouteMarkerComponent {}

const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'forecast' },
	{ path: 'forecast', component: RouteMarkerComponent },
	{ path: 'news', component: RouteMarkerComponent },
	{ path: 'photos', component: RouteMarkerComponent },
	{ path: 'contact', component: RouteMarkerComponent },
	{ path: '404', component: RouteMarkerComponent },
	{ path: '**', redirectTo: '404' },
];

bootstrapApplication(AppComponent, { providers: [provideRouter(routes)] }).catch((err) => console.error(err));
