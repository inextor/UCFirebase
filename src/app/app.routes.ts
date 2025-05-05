import { Routes } from '@angular/router';
import { ListProductsComponent } from './pages/list-products/list-products.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  {
    path: '',
    component: ListProductsComponent,
  },
  {
    path: '/login',
    component: LoginComponent,
  },
];
