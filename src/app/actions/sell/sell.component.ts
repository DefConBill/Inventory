import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Item, Move } from 'src/models/item.model';
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
  addingSKU: string = '';
  addingDescription: string = '';
  addingId: string = '';
  showAddItem: boolean = false;
  addingItem: boolean = false;
  showButton: boolean = false;
  refError: boolean = false;
  locationError: boolean = false;
  searchText: string = '';
  showSuccess: boolean = false;
  showFailure: boolean = false;

  itemForm = this.fb.group({
    quantity: ['', [Validators.required]],
    cost: ['', [Validators.required]]
  });

  constructor(private fb: FormBuilder, private itemService: ItemsService) { }

  ngOnInit(): void {
    this.itemService.getItems().subscribe(results => {
      this.items = results.data;
    })
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
    this.searchedItems = this.items.filter((item: Item) => {
      return item.description.toLowerCase().includes(event.target.value.toLowerCase());
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

  processInvoice() {
    this.listItems.forEach((item: Move) => {
      this.itemService.getQuantity(item.itemId!).subscribe(results => {
        const quantityRecords = results.data;
        const quantityRecord = quantityRecords.find((record: any) => {
          return record.location === this.location;
        });
        const newQuantity = quantityRecord!.quantity - item.quantity;
        if (quantityRecord) {
          if (quantityRecord._id) {
            this.itemService.updateQuantity(quantityRecord._id, newQuantity)
            this.itemService.getItem(item.itemId!).subscribe(results => {
              const itemToUpdate = results.data;
              const newItemQuantity = itemToUpdate.quantity - item.quantity;
              this.itemService.updateItemQuantity(item.itemId!, newItemQuantity).subscribe();
              this.listItems = [];
              this.refNumber = '';
              this.showButton = false;
              this.showSuccess = true;
            });
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
