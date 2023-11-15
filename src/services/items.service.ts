import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item, Quantity } from 'src/models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {

  constructor(private http: HttpClient) { }

  getItems() {
    return this.http.get<{ success: boolean, count: number, pagination: any, data: Item[] }>('https://api.hottubuniverse.ca/api/v1/items')
  }

  getItem(id: string) {
    return this.http.get<{ success: boolean, data: Item }>(`https://api.hottubuniverse.ca/api/v1/items/${id}`)
  }

  addItem(item: Item) {
    return this.http.post<{ success: boolean, data: Item }>('https://api.hottubuniverse.ca/api/v1/items', item)
  }

  updateItem(id: string, sku: string, description: string, category: string, cost: number, price: number) {
    const body = {
      sku: sku,
      description: description,
      category: category,
      cost: cost,
      price: price
    }
    return this.http.put<{ success: boolean, data: Item }>(`https://api.hottubuniverse.ca/api/v1/items/${id}`, body)
  }

  getQuantity(id: string) {
    return this.http.get<{ success: boolean, data: Quantity[] }>(`https://api.hottubuniverse.ca/api/v1/items/${id}/quantities`)
  }

  updateQuantity(id: string, newQty: number) {
    const body = {
      quantity: newQty
    }
    return this.http.put<{ success: boolean, data: Quantity }>(`https://api.hottubuniverse.ca/api/v1/quantities/${id}`, body).subscribe();
  }

  updateItemQuantity(id: string, newQty: number) {
    const body = {
      quantity: newQty
    }
    return this.http.put<{ success: boolean, data: Quantity }>(`https://api.hottubuniverse.ca/api/v1/items/${id}`, body);
  }
}
