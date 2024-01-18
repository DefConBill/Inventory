import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Item, Move } from 'src/models/item.model';
import { Movement } from 'src/models/movement.model';
import { AuthService } from 'src/services/auth.service';
import { ItemsService } from 'src/services/items.service';

@Component({
  selector: 'app-receive',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit {
  listItem!: Move;
  listItems: Move[] = [];
  items: Item[] = [];
  searchedItems: Item[] = [];
  refNumber: string = '';
  addingSKU: string = '';
  addingDescription: string = '';
  addingCost: number = 0;
  addingQuantity: number = 0;
  addingId: string = '';
  showAddItem: boolean = false;
  addingItem: boolean = false;
  showButton: boolean = false;
  refError: boolean = false;
  searchText: string = '';
  showSuccess: boolean = false;
  showFailure: boolean = false;
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
    console.log(this.items)
  }

  showAddBlock() {
    if (this.refNumber === '') {
      this.refError = true;
      return;
    }
    this.addingItem = true;
    this.refError = false;
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
    this.addingCost = item.cost;
    this.addingId = item._id ?? '';
    this.searchedItems = [];
    this.searchedItems = [];
    this.searchText = '';
    this.showAddItem = true;
  }

  addItem() {
    const itemToAdd = new Move(this.addingSKU, this.addingDescription, this.addingQuantity, this.addingCost, this.addingId);
    this.listItems.push(itemToAdd);
    this.showAddItem = false;
    this.showButton = true;
    this.itemForm.reset();
  }

  processReceipt() {
    this.listItems.forEach((item: Move) => {
      this.itemService.getQuantity(item.itemId!).subscribe(results => {
        const quantityRecords = results.data;
        const quantityRecord = quantityRecords.find((record: any) => {
          return record.location === 'Shop';
        });
        const newQuantity = quantityRecord!.quantity + item.quantity;
        if (quantityRecord) {
          quantityRecord.quantity = quantityRecord.quantity + item.quantity;
          if (quantityRecord._id) {
            this.itemService.updateQuantity(quantityRecord._id, newQuantity)
            this.itemService.getItem(item.itemId!).subscribe(results => {
              const itemToUpdate = results.data;
              const newItemQuantity = itemToUpdate.quantity + item.quantity;
              this.itemService.updateItemQuantity(item.itemId!, newItemQuantity).subscribe();
              this.listItems = [];
              this.refNumber = '';
              this.showButton = false;
              this.showSuccess = true;
            });
          }
          //update the item costs
          const newCost = item.price;
          this.itemService.updateCost(item.itemId!, newCost).subscribe();
          const movement: Movement = {
            user: this.user,
            type: 'Receipt',
            reference: this.refNumber,
            location: "Shop",
            quantity: item.quantity,
            item: item.itemId!,
          }
          this.itemService.addMovement(movement);
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
