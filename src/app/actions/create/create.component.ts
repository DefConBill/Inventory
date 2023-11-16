import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Item } from 'src/models/item.model';
import { ItemsService } from 'src/services/items.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  skuError: boolean = false;
  categoryError: boolean = false;
  descriptionError: boolean = false;
  costError: boolean = false;
  priceError: boolean = false;
  showSuccess: boolean = false;
  showFailure: boolean = false;
  showDuplicate: boolean = false;

  itemForm = this.fb.group({
    sku: ['', [Validators.required]],
    description: ['', [Validators.required]],
    category: ['', [Validators.required]],
    cost: ['', [Validators.required]],
    price: ['', [Validators.required]]
  });

  constructor(private fb: FormBuilder, private itemService: ItemsService) { }

  ngOnInit(): void {
  }

  onSubmit() {
    //check to see if sku exists
    this.itemService.getItems().subscribe(results => {
      const items = results.data;
      const found = items.find((item: Item) => {
        return item.sku === this.itemForm.value.sku;
      });
      if (found) {
        this.showDuplicate = true;
        return;
      }
      this.clearErrors();
      if (this.itemForm.value.sku == '') {
        this.skuError = true;
        return;
      }
      if (this.itemForm.value.category == '') {
        this.categoryError = true;
        return;
      }
      if (this.itemForm.value.description == '') {
        this.descriptionError = true;
        return;
      }
      if (Number(this.itemForm.value.cost) == 0) {
        this.costError = true;
        return;
      }
      if (Number(this.itemForm.value.price) == 0) {
        this.priceError = true;
        return;
      }
      const item: Item = {
        sku: this.itemForm.value.sku,
        description: this.itemForm.value.description,
        category: this.itemForm.value.category,
        cost: this.itemForm.value.cost,
        price: this.itemForm.value.price,
        quantity: 0
      }
      this.itemService.addItem(item)
        .subscribe({
          next: (result: any) => {
            this.showSuccess = true;
            this.showFailure = false;
            this.showDuplicate = false;
            this.itemForm.reset();
          },
          error: (err: any) => {
            this.showSuccess = false;
            this.showFailure = true;
          }
        })

    });

  }

  clearErrors() {
    this.skuError = false;
    this.descriptionError = false;
    this.costError = false;
    this.priceError = false;
  }

  dismissAlert() {
    this.showSuccess = false;
    this.showFailure = false;
  }

}
