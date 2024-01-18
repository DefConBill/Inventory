export class Movement {
  constructor(
    public user: string,
    public type: string,
    public reference: string,
    public location: string,
    public quantity: number,
    public item: string
  ) { }
}
