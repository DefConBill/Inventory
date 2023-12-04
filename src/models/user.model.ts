export class AuthData {
  constructor(
    public email: string,
    public password: string,
  ) { }
}
export class User {
  constructor(
    public name: string,
    public email: string,
    public password: string,
    public role: string,
    public _id?: string
  ) { }
}
