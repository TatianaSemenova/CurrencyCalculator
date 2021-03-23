export interface Currencies {
  base: string,
  date: string,
  rates: {
    [key: string] : number
  },
}
