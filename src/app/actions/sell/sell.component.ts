import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Item, Move } from 'src/models/item.model';
import { Movement } from 'src/models/movement.model';
import { ItemsService } from 'src/services/items.service';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss']
})
export class SellComponent implements OnInit {
  listItem!: Move;
  listItems: Move[] = [];
  items: Item[] = [];
  searchedItems: Item[] = [];
  refNumber: string = '';
  location: string = 'Select Location';
  customer: string = '';
  addingSKU: string = '';
  addingDescription: string = '';
  addingCost: number = 0;
  addingQuantity: number = 0;
  addingWarranty: boolean = false;
  addingId: string = '';
  showAddItem: boolean = false;
  addingItem: boolean = false;
  showButton: boolean = false;
  refError: boolean = false;
  locationError: boolean = false;
  customerError: boolean = false;
  searchText: string = '';
  showSuccess: boolean = false;
  showFailure: boolean = false;

  itemForm = this.fb.group({
    quantity: ['', [Validators.required]],
    cost: ['', [Validators.required]]
  });

  constructor(private fb: FormBuilder, private itemService: ItemsService) { }

  ngOnInit(): void {
    this.itemService.getItems(1, 10000).subscribe(results => {
      this.items = results.data;
    })
  }

  showAddBlock() {
    if (this.customer === '') {
      this.customerError = true;
      return;
    }
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
    this.customerError = false;
  }

  findItem(event: any) {
    this.showAddItem = false;
    this.searchedItems = this.items.filter((item: Item) => {
      return item.description.toLowerCase().includes(event.target.value.toLowerCase());
    });
  }

  selectItem(item: Item) {
    this.addingSKU = item.sku;
    this.addingDescription = item.description;
    this.addingCost = item.price;
    this.addingId = item._id ?? '';
    this.searchedItems = [];
    this.searchedItems = [];
    this.searchText = '';
    this.showAddItem = true;
  }

  addItem() {
    const itemToAdd = new Move(this.addingSKU, this.addingDescription, this.addingQuantity, this.addingCost, this.addingId, this.addingWarranty);
    this.listItems.push(itemToAdd);
    this.showAddItem = false;
    this.showButton = true;
    this.itemForm.reset();
  }

  processInvoice() {
    this.listItems.forEach((item: Move) => {
      let itemLocation = this.location
      let invoiceNumber = this.refNumber
      let saleQuantity = item.quantity
      this.itemService.getQuantity(item.itemId!).subscribe(results => {
        const quantityRecords = results.data;
        const quantityRecord = quantityRecords.find((record: any) => {
          return record.location === itemLocation;
        });
        console.log("Quantity Record: ", quantityRecord)
        const newQuantity = quantityRecord!.quantity - item.quantity;
        if (quantityRecord) {
          if (quantityRecord._id) {
            this.itemService.updateQuantity(quantityRecord._id, newQuantity)
            this.itemService.getItem(item.itemId!).subscribe(results => {
              const itemToUpdate = results.data;
              const newItemQuantity = itemToUpdate.quantity - saleQuantity;
              this.itemService.updateItemQuantity(item.itemId!, newItemQuantity).subscribe();
              const movement: Movement = {
                type: 'Sale',
                reference: invoiceNumber,
                location: itemLocation,
                quantity: 0 - saleQuantity,
                item: item.itemId!,
              }
              this.itemService.addMovement(movement);
            });
          }
        } else {
          this.showFailure = true;
        }
      });
    });
    this.listItems = [];
    this.refNumber = '';
    this.location = 'Select Location';
    this.customer = '';
    this.addingSKU = '';
    this.addingDescription = '';
    this.addingCost = 0;
    this.addingQuantity = 0;
    this.showButton = false;
    this.showSuccess = true;
  }

  dismissAlert() {
    this.showSuccess = false;
    this.showFailure = false;
  }
}
