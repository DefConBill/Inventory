import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './layout/main/main.component';
import { CreateComponent } from './actions/create/create.component';
import { EditComponent } from './actions/edit/edit.component';
import { ReceiveComponent } from './actions/receive/receive.component';
import { SellComponent } from './actions/sell/sell.component';
import { TransferComponent } from './actions/transfer/transfer.component';
import { AdjustComponent } from './actions/adjust/adjust.component';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from 'src/services/auth.guard';

const routes: Routes = [
  { path: '', component: AuthComponent },
  { path: 'items', component: MainComponent, canActivate: [AuthGuard] },
  { path: 'create', component: CreateComponent, canActivate: [AuthGuard] },
  { path: 'edit/:id', component: EditComponent, canActivate: [AuthGuard] },
  { path: 'receive', component: ReceiveComponent, canActivate: [AuthGuard] },
  { path: 'sell', component: SellComponent, canActivate: [AuthGuard] },
  { path: 'transfer', component: TransferComponent, canActivate: [AuthGuard] },
  { path: 'adjust', component: AdjustComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
