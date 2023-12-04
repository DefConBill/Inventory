import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/services/auth.service';
import { Dropdown, initTE } from "tw-elements";
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  name: any = "";
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    initTE({ Dropdown });
    this.name = localStorage.getItem("name");

  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }

}
