import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Item, Quantity } from 'src/models/item.model';
import { Movement } from 'src/models/movement.model';
import { ItemsService } from 'src/services/items.service';
import { Input, initTE } from "tw-elements";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  searching: boolean = false;
  isModalOpen: boolean = false;
  showMoving: boolean = false;
  quantityError: boolean = false;
  referenceError: boolean = false;
  moveType: string = '';
  currentPage: number = 1;
  lastPageNumber: number = 1;
  items: Item[] = [];
  selectedItem!: Item
  itemQuantities: Quantity[] = [];
  selectedQuantityRecord!: Quantity;
  transferToQuantityRecord!: Quantity;

  qtyForm = this.fb.group({
    fromLocation: ['Shop', [Validators.required]],
    toLocation: ['', [Validators.required]],
    quantity: ['', [Validators.required]],
    reference: ['', [Validators.required]]
  });

  constructor(private itemService: ItemsService, private fb: FormBuilder) { }

  ngOnInit(): void {
    initTE({ Input });
    this.loadItems();
  }

  loadItems() {
    this.itemService.getItems(1, 20).subscribe(results => {
      this.items = results.data;
      console.log(results.pagination.next.total);
      this.lastPageNumber = Math.ceil(results.pagination.next.total / 20);
      console.log(this.lastPageNumber);
    })
  }

  firstPage() {
    this.loadItems();
  }

  nextPage() {
    this.currentPage++;
    this.itemService.getItems(this.currentPage, 20).subscribe(results => {
      this.items = results.data;
    })
  }

  previousPage() {
    this.currentPage--;
    this.itemService.getItems(this.currentPage, 20).subscribe(results => {
      this.items = results.data;
    })
  }

  lastPage() {
    this.currentPage = this.lastPageNumber;
    this.itemService.getItems(this.lastPageNumber, 20).subscribe(results => {
      this.items = results.data;
    })
  }

  filterCategories(event: any) {
    this.itemService.getItems(1, 20).subscribe(results => {
      this.items = results.data;
      if (event.target.value === 'All Categories') {
        return
      }
      this.items = this.items.filter((item: Item) => {
        return item.category.toLowerCase().includes(event.target.value.toLowerCase());
      });
    })
  }

  searchProducts(event: any) {
    this.searching = true;
    this.items = this.items.filter((item: Item) => {
      return item.description.toLowerCase().includes(event.target.value.toLowerCase());
    });
    console.log(event.target.value);
  }

  selectItem(item: Item) {
    this.selectedItem = item;
    this.itemService.getQuantity(item._id!).subscribe(results => {
      this.itemQuantities = results.data;
      this.isModalOpen = true;
    });
  }

  openMoving(type: string) {
    this.isModalOpen = false;
    this.showMoving = true;
    this.moveType = type;
  }

  processMove() {
    let qty = this.qtyForm.value.quantity;
    if (qty === 0) {
      this.quantityError = true;
      return;
    }

    switch (this.moveType) {
      case 'Receive':
        if (this.qtyForm.value.reference === '') {
          this.referenceError = true;
          return;
        }
        this.selectedQuantityRecord = this.itemQuantities.find((quantity: Quantity) => {
          return quantity.location === 'Shop';
        })!;
        this.selectedQuantityRecord.quantity += qty;
        this.itemService.updateQuantity(this.selectedQuantityRecord._id!, this.selectedQuantityRecord.quantity);
        this.itemService.updateItemQuantity(this.selectedItem._id!, this.selectedItem.quantity! + qty).subscribe(result => {
          window.location.reload();
        });
        const receiptMovement: Movement = {
          type: 'Receipt',
          reference: this.qtyForm.value.reference,
          location: 'Shop',
          quantity: qty,
          item: this.selectedItem._id!,
        }
        this.itemService.addMovement(receiptMovement);
        break;
      case 'Sell':
        if (this.qtyForm.value.reference === '') {
          this.referenceError = true;
          return;
        }
        this.selectedQuantityRecord = this.itemQuantities.find((quantity: Quantity) => {
          return quantity.location === this.qtyForm.value.fromLocation;
        })!;
        this.selectedQuantityRecord.quantity -= qty;
        this.itemService.updateQuantity(this.selectedQuantityRecord._id!, this.selectedQuantityRecord.quantity);
        this.itemService.updateItemQuantity(this.selectedItem._id!, this.selectedItem.quantity! - qty).subscribe(result => {
          window.location.reload();
        });
        const saleMovement: Movement = {
          type: 'Sale',
          reference: this.qtyForm.value.reference,
          location: this.qtyForm.value.fromLocation,
          quantity: qty,
          item: this.selectedItem._id!,
        }
        this.itemService.addMovement(saleMovement);
        break;
      case 'Transfer':
        this.selectedQuantityRecord = this.itemQuantities.find((quantity: Quantity) => {
          return quantity.location === this.qtyForm.value.fromLocation;
        })!;
        this.selectedQuantityRecord.quantity -= qty;
        this.itemService.updateQuantity(this.selectedQuantityRecord._id!, this.selectedQuantityRecord.quantity);
        this.transferToQuantityRecord = this.itemQuantities.find((quantity: Quantity) => {
          return quantity.location === this.qtyForm.value.toLocation;
        })!;
        this.transferToQuantityRecord.quantity += qty;
        this.itemService.updateQuantity(this.transferToQuantityRecord._id!, this.transferToQuantityRecord.quantity);
        const fromMovement: Movement = {
          type: 'Transfer',
          reference: 'Transfer Out',
          location: this.qtyForm.value.fromLocation,
          quantity: 0 - qty,
          item: this.selectedItem._id!,
        }
        this.itemService.addMovement(fromMovement);
        const toMovement: Movement = {
          type: 'Transfer',
          reference: 'Transfer In',
          location: this.qtyForm.value.toLocation,
          quantity: qty,
          item: this.selectedItem._id!,
        }
        this.itemService.addMovement(toMovement);
        break;
      case 'Adjust':
        if (this.qtyForm.value.reference === '') {
          this.referenceError = true;
          return;
        }
        this.selectedQuantityRecord = this.itemQuantities.find((quantity: Quantity) => {
          return quantity.location === this.qtyForm.value.fromLocation;
        })!;
        this.selectedQuantityRecord.quantity += qty;
        this.itemService.updateQuantity(this.selectedQuantityRecord._id!, this.selectedQuantityRecord.quantity);
        this.itemService.updateItemQuantity(this.selectedItem._id!, this.selectedItem.quantity! + qty).subscribe(result => {
          window.location.reload();
        });
        const adjustMovement: Movement = {
          type: 'Adjustment',
          reference: this.qtyForm.value.reference,
          location: this.qtyForm.value.fromLocation,
          quantity: qty,
          item: this.selectedItem._id!,
        }
        this.itemService.addMovement(adjustMovement);
        break;
    }

    this.qtyForm.reset();
    this.showMoving = false;
  }

  resetSearch() {
    this.loadItems();
    this.searching = false;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  closeMoving() {
    this.showMoving = false;
  }
}
