import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { Item } from 'src/models/item.model';
import { ItemsService } from 'src/services/items.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, OnDestroy {
  skuError: boolean = false;
  categoryError: boolean = false;
  descriptionError: boolean = false;
  costError: boolean = false;
  priceError: boolean = false;
  showSuccess: boolean = false;
  showFailure: boolean = false;
  itemSub!: Subscription
  selectedItem!: Item
  selectedItemId: string = '';

  itemForm = this.fb.group({
    sku: ['', [Validators.required]],
    description: ['', [Validators.required]],
    category: ['', [Validators.required]],
    cost: ['', [Validators.required]],
    price: ['', [Validators.required]]
  });
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private itemService: ItemsService) { }

  ngOnInit(): void {
    this.itemSub = this.route.params
      .subscribe(
        (params: Params) => {
          const id = params['id'];
          this.itemService.getItem(id).subscribe(res => {
            this.selectedItem = res.data;
            this.selectedItemId = res.data._id!;
            this.itemForm.setValue({
              sku: res.data.sku,
              description: res.data.description,
              category: res.data.category,
              cost: res.data.cost,
              price: res.data.price
            })
          });
        }
      )
  }

  onSubmit() {
    this.itemService.updateItem(this.selectedItemId, this.itemForm.value.sku, this.itemForm.value.description, this.itemForm.value.category, this.itemForm.value.cost, this.itemForm.value.price).subscribe(res => {
      if (res.success) {
        this.showSuccess = true;
      } else {
        this.showFailure = true;
      }
    })
  }

  dismissAlert() {
    this.showSuccess = false;
    this.showFailure = false;
  }

  ngOnDestroy(): void {
    this.itemSub.unsubscribe();
  }

}
