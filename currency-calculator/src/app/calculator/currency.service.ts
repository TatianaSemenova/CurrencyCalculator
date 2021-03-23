import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators'
import { Currencies } from '../models/currencies';
import { IdValue } from '../models/IdValue';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  private responseCache = new Map();

  constructor(private http: HttpClient) { }

  getCurrenciesList(currency: string = 'USD'): Observable<IdValue[]> {
    const url = `https://api.exchangeratesapi.io/latest?&base=${currency}`;
    const valueFromCache = this.responseCache.get(url);

    if (valueFromCache) {
      return of(valueFromCache);
    }

    return this.http.get<Currencies>(url)
    .pipe(
      map((data: Currencies) => {
        const result = Object.keys(data?.rates).map(key => ({
          id: key,
          value: data?.rates[key]
        } as IdValue))

        result.sort((a,b) => a.id.localeCompare(b.id));

        this.responseCache.set(url, result);
        return result;
      })
    )
  }
}
