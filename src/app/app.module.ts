import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { MainComponent } from './layout/main/main.component';
import { ReceiveComponent } from './actions/receive/receive.component';
import { TransferComponent } from './actions/transfer/transfer.component';
import { SellComponent } from './actions/sell/sell.component';
import { AdjustComponent } from './actions/adjust/adjust.component';
import { CreateComponent } from './actions/create/create.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditComponent } from './actions/edit/edit.component';
import { AuthComponent } from './auth/auth.component';
import { AuthInterceptor } from 'src/services/auth-interceptor';
import { AuthService } from 'src/services/auth.service';
import { AuthGuard } from 'src/services/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MainComponent,
    ReceiveComponent,
    TransferComponent,
    SellComponent,
    AdjustComponent,
    CreateComponent,
    EditComponent,
    AuthComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }, AuthService, AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
