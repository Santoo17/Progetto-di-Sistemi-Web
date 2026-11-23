import { Routes } from '@angular/router';
import { CartPageComponent } from './features/cart/cart-page/cart-page';

import { checkoutGuard } from './core/guard/checkout-guard';
import { ProductForm } from './features/products/product-form/product-form';
import { adminGuard } from './core/guard/admin-guard';

export const routes: Routes = [
    { path: '', redirectTo: 'products', pathMatch: 'full' },
    { path: 'orders', canActivate: [checkoutGuard], loadComponent: () =>
      import('./features/orders/order-list/order-list').then(m => m.OrderList) }, 
    { path: 'products', loadComponent: () =>
      import('./features/products/product-list/product-list').then(m => m.ProductListComponent) },
    { path: 'products/new', component: ProductForm, canActivate: [adminGuard] },
    { path: 'products/edit/:id', component: ProductForm, canActivate: [adminGuard] },
    { path: 'products/:id', loadComponent: () =>
      import('./features/products/product-detail/product-detail').then(m => m.ProductDetail) },
    { path: 'checkout', canActivate: [checkoutGuard], loadComponent: () =>
      import('./features/checkout/checkout-page/checkout-page').then(m => m.CheckoutPage) },
    { path: 'login', loadComponent: () =>
      import('./features/login/login').then(m => m.Login) },
    { path: 'cart', canActivate: [checkoutGuard], component: CartPageComponent },
    { path: 'register', loadComponent: () => import('./features/register/register').then(m => m.Register) },
    { path: '**', loadComponent: () => import('./shared/page-not-found').then(m => m.NotFoundComponent) },
];