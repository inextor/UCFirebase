import { Routes } from '@angular/router';
import { ListProductsComponent } from './pages/list-products/list-products.component';
import { LoginComponent } from './pages/login/login.component';
import { ListUserComponent } from './pages/list-user/list-user.component';
import { SaveUserComponent } from './pages/save-user/save-user.component';

export const routes: Routes = [
  {
    path: '',
    component: ListProductsComponent,
  },
    {
    path: 'user/list',
    component: ListUserComponent,
  },
    {
    path: 'user/save',
    component: SaveUserComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
];
