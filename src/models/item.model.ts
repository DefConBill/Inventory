export class Quantity {
  constructor(
    public item: string,
    public location: String,
    public quantity: number,
    public _id?: string
  ) { }
}

export class Item {
  constructor(
    public sku: string,
    public description: string,
    public category: string,
    public cost: number,
    public price: number,
    public quantity: number,
    public _id?: string
  ) { }
}

export class Move {
  constructor(
    public sku: string,
    public description: string,
    public quantity: number,
    public price: string,
    public itemId: string
  ) { }
}
