import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Item, Move } from 'src/models/item.model';
import { Movement } from 'src/models/movement.model';
import { AuthService } from 'src/services/auth.service';
import { ItemsService } from 'src/services/items.service';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit {
  listItem!: Move;
  listItems: Move[] = [];
  items: Item[] = [];
  searchedItems: Item[] = [];
  refNumber: string = '';
  fromLocation: string = 'Select Location';
  toLocation: string = 'Select Location';
  addingSKU: string = '';
  addingDescription: string = '';
  addingId: string = '';
  showAddItem: boolean = false;
  addingItem: boolean = false;
  showButton: boolean = false;
  showItemHeader: boolean = false;
  refError: boolean = false;
  fromLocationError: boolean = false;
  toLocationError: boolean = false;
  searchText: string = '';
  showSuccess: boolean = false;
  showFailure: boolean = false;
  user: string = '';

  itemForm = this.fb.group({
    quantity: ['', [Validators.required]]
  });

  constructor(private fb: FormBuilder, private itemService: ItemsService, private auth: AuthService) { }

  ngOnInit(): void {
    this.itemService.getItems(1, 10000).subscribe(results => {
      this.items = results.data;
    });
    this.user = this.auth.getFullName();
  }

  showAddBlock() {
    this.fromLocationError = false;
    this.toLocationError = false;
    if (this.fromLocation === 'Select Location') {
      this.fromLocationError = true;
      return;
    }
    if (this.toLocation === 'Select Location') {
      this.toLocationError = true;
      return;
    }
    this.addingItem = true;
    this.refError = false;
    this.fromLocationError = false;
    this.toLocationError = false;
  }

  findItem(event: any) {
    this.showAddItem = false;
    this.showItemHeader = true;
    this.searchedItems = this.items.filter((item: Item) => {
      return item.description.toLowerCase().includes(event.target.value.toLowerCase());
    });
    this.searchedItems.forEach((item: Item) => {
      item.quantities = item.quantities?.sort((a: any, b: any) => {
        if (a.location < b.location) {
          return -1;
        }
        if (a.location > b.location) {
          return 1;
        }
        return 0;
      });
    });
  }

  selectItem(item: Item) {
    this.addingSKU = item.sku;
    this.addingDescription = item.description;
    this.addingId = item._id ?? '';
    this.searchedItems = [];
    this.searchedItems = [];
    this.searchText = '';
    this.showAddItem = true;
  }

  addItem() {
    const itemToAdd = new Move(this.addingSKU, this.addingDescription, this.itemForm.value.quantity, this.itemForm.value.cost, this.addingId);
    this.listItems.push(itemToAdd);
    this.showAddItem = false;
    this.showButton = true;
    this.itemForm.reset();
  }

  processTransfer() {
    this.listItems.forEach((item: Move) => {
      this.itemService.getQuantity(item.itemId!).subscribe(results => {
        const quantityRecords = results.data;
        const quantityRecord = quantityRecords.find((record: any) => {
          return record.location === this.fromLocation;
        });
        const newQuantity = quantityRecord!.quantity - item.quantity;
        if (quantityRecord) {
          if (quantityRecord._id) {
            this.itemService.updateQuantity(quantityRecord._id, newQuantity)
            const movement: Movement = {
              user: this.user,
              type: 'Transfer',
              reference: "Transfer Out",
              location: this.fromLocation,
              quantity: 0 - item.quantity,
              item: item.itemId!,
            }
            this.itemService.addMovement(movement);
            this.listItems = [];
            this.refNumber = '';
            this.showButton = false;
            this.showSuccess = true;
          }
        } else {
          this.showFailure = true;
        }
      });
    });
    this.listItems.forEach((item: Move) => {
      this.itemService.getQuantity(item.itemId!).subscribe(results => {
        const quantityRecords = results.data;
        const quantityRecord = quantityRecords.find((record: any) => {
          return record.location === this.toLocation;
        });
        const newQuantity = quantityRecord!.quantity + item.quantity;
        if (quantityRecord) {
          if (quantityRecord._id) {
            this.itemService.updateQuantity(quantityRecord._id, newQuantity)
            const movement: Movement = {
              user: this.user,
              type: 'Transfer',
              reference: "Transfer In",
              location: this.fromLocation,
              quantity: item.quantity,
              item: item.itemId!,
            }
            this.itemService.addMovement(movement);
            this.listItems = [];
            this.refNumber = '';
            this.showButton = false;
            this.showSuccess = true;
          }
        } else {
          this.showFailure = true;
        }
      });
    });
  }

  dismissAlert() {
    this.showSuccess = false;
    this.showFailure = false;
  }
}
