import { Component, OnInit } from '@angular/core';
import { Dropdown, initTE } from "tw-elements";
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    initTE({ Dropdown });
  }

}
