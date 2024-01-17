import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item, Quantity } from 'src/models/item.model';
import { Movement } from 'src/models/movement.model';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {

  constructor(private http: HttpClient) { }

  getItems(page: number, limit: number) {
    return this.http.get<{ success: boolean, count: number, pagination: any, data: Item[] }>(`https://api.hottubuniverse.ca/api/v1/items?page=${page}&limit=${limit}`)
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

  updateCost(id: string, cost: number) {
    const body = {
      cost: cost
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

  addMovement(movement: Movement) {
    return this.http.post<{ success: boolean, data: any }>(`https://api.hottubuniverse.ca/api/v1/items/${movement.item}/movements`, movement).subscribe();

  }
}
