import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { AuthData } from "src/models/user.model";

@Injectable({ providedIn: "root" })
export class AuthService {
  private isAuthenticated: boolean = false;
  private token!: any;
  private tokenTimer: any;
  private userId!: any;
  private userFullName!: any;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) { }

  getToken() {
    this.token = localStorage.getItem("token");
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getFullName() {
    this.userFullName = localStorage.getItem("name")
    return this.userFullName;
  }

  login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http
      .post<{ token: string; expiresIn: number, userId: string }>(
        "https://api.hottubuniverse.ca/api/v1/auth/login",
        authData
      )
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        if (token) {
          const expiresInDuration = 24 * 60 * 60 * 1000;
          this.setAuthTimer(expiresInDuration);
          this.userId = response.userId;
          const now = new Date();
          this.http.get<any>(`https://api.hottubuniverse.ca/api/v1/auth/me?email=${email}`).subscribe(result => {
            this.userId = result.data._id;
            const name = result.data.name;
            const userRole = result.data.role;
            const expirationDate = new Date(now.getTime() + expiresInDuration);
            this.isAuthenticated = true;
            this.authStatusListener.next(true);
            this.saveAuthData(token, expirationDate, this.userId, name, userRole);
            this.router.navigate(["/items"]);
          })
        }
      });
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(["/"]);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string, name: string, role: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
    localStorage.setItem("userId", userId);
    localStorage.setItem("name", name);
    localStorage.setItem("role", role);
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const userId = localStorage.getItem("userId");
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
      name: name,
      role: role
    }
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }
}
