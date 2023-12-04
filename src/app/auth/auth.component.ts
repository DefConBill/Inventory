import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  showFailure: boolean = false;
  emailError: boolean = false;
  passwordError: boolean = false;
  loginForm = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  constructor(private fb: FormBuilder, private authService: AuthService) { }

  ngOnInit(): void {
  }

  onSubmit() {
    this.resetAlerts();
    if (this.loginForm.value.email == '') {
      this.emailError = true;
      return;
    }
    if (this.loginForm.value.password == '') {
      this.passwordError = true;
      return;
    }
    this.authService.login(this.loginForm.value.email, this.loginForm.value.password);
  }

  dismissAlert() {
    this.showFailure = false;
  }

  resetAlerts() {
    this.emailError = false;
    this.passwordError = false;
  }
}
