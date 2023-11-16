import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './layout/main/main.component';
import { CreateComponent } from './actions/create/create.component';
import { EditComponent } from './actions/edit/edit.component';
import { ReceiveComponent } from './actions/receive/receive.component';
import { SellComponent } from './actions/sell/sell.component';
import { TransferComponent } from './actions/transfer/transfer.component';
import { AdjustComponent } from './actions/adjust/adjust.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'create', component: CreateComponent },
  { path: 'edit/:id', component: EditComponent },
  { path: 'receive', component: ReceiveComponent },
  { path: 'sell', component: SellComponent },
  { path: 'transfer', component: TransferComponent },
  { path: 'adjust', component: AdjustComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
