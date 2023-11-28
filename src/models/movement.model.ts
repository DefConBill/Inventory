export class Movement {
  constructor(
    public type: string,
    public reference: string,
    public location: string,
    public quantity: number,
    public item: string
  ) { }
}
