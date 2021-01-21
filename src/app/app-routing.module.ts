import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LibraryComponent } from './library/library.component';

const routes: Routes = [
  { path: 'library', component: LibraryComponent, pathMatch: 'full'}  
];

@NgModule({
  //imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
