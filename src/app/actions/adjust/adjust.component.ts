import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Item, Move } from 'src/models/item.model';
import { Movement } from 'src/models/movement.model';
import { AuthService } from 'src/services/auth.service';
import { ItemsService } from 'src/services/items.service';

@Component({
  selector: 'app-adjust',
  templateUrl: './adjust.component.html',
  styleUrls: ['./adjust.component.scss']
})
export class AdjustComponent implements OnInit {
  listItem!: Move;
  listItems: Move[] = [];
  items: Item[] = [];
  searchedItems: Item[] = [];
  refNumber: string = '';
  addingSKU: string = '';
  addingDescription: string = '';
  addingId: string = '';
  showAddItem: boolean = false;
  addingItem: boolean = false;
  showButton: boolean = false;
  refError: boolean = false;
  showItemHeader: boolean = false;
  searchText: string = '';
  showSuccess: boolean = false;
  showFailure: boolean = false;
  location: string = 'Select Location';
  locationError: boolean = false;
  user: string = '';

  itemForm = this.fb.group({
    quantity: ['', [Validators.required]],
    cost: ['', [Validators.required]]
  });

  constructor(private fb: FormBuilder, private itemService: ItemsService, private auth: AuthService) { }

  ngOnInit(): void {
    this.itemService.getItems(1, 10000).subscribe(results => {
      this.items = results.data;
    });
    this.user = this.auth.getFullName();
  }

  showAddBlock() {
    if (this.refNumber === '') {
      this.refError = true;
      return;
    }
    if (this.location === 'Select Location') {
      this.refError = false;
      this.locationError = true;
      return;
    }
    this.addingItem = true;
    this.refError = false;
    this.locationError = false;
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
    this.showItemHeader = false;
  }

  addItem() {
    const itemToAdd = new Move(this.addingSKU, this.addingDescription, this.itemForm.value.quantity, this.itemForm.value.cost, this.addingId);
    this.listItems.push(itemToAdd);
    this.showAddItem = false;
    this.showButton = true;
    this.itemForm.reset();
  }

  processAdjustment() {
    this.listItems.forEach((item: Move) => {
      let itemLocation = this.location
      let adjustQuantity = item.quantity
      let reason = this.refNumber
      this.itemService.getQuantity(item.itemId!).subscribe(results => {
        const quantityRecords = results.data;
        const quantityRecord = quantityRecords.find((record: any) => {
          return record.location === itemLocation;
        });
        const newQuantity = quantityRecord!.quantity + adjustQuantity;
        if (quantityRecord) {
          quantityRecord.quantity = quantityRecord.quantity + adjustQuantity;
          if (quantityRecord._id) {
            this.itemService.updateQuantity(quantityRecord._id, newQuantity)
            this.itemService.getItem(item.itemId!).subscribe(results => {
              const itemToUpdate = results.data;
              const newItemQuantity = itemToUpdate.quantity + adjustQuantity;
              this.itemService.updateItemQuantity(item.itemId!, newItemQuantity).subscribe();
              this.listItems = [];
              this.refNumber = '';
              this.showButton = false;
              this.showSuccess = true;
            });
            const movement: Movement = {
              user: this.user,
              type: 'Adjustment',
              reference: reason,
              location: itemLocation,
              quantity: adjustQuantity,
              item: item.itemId!,
            }
            this.itemService.addMovement(movement);
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
