import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CurrencyService } from '../currency.service';
import { IdValue } from '../../models/IdValue';

@Component({
  selector: 'app-calculator-page',
  templateUrl: './calculator-page.component.html',
  styleUrls: ['./calculator-page.component.scss']
})
export class CalculatorPageComponent implements OnInit, OnDestroy {
  public currencies: IdValue[];
  public form: FormGroup;

  public get originCurrencyGroup(): FormControl {
    return this.form.get('originCurrency') as FormControl;
  }

  public get originQuantityGroup(): FormControl {
    return this.form.get('originQuantity') as FormControl;
  }

  public get calculationsListGroup(): FormArray {
    return this.form.get('calculationsList') as FormArray;
  }

  public get newCurrencyGroup(): FormGroup {
    return this.form.get('newCurrency') as FormGroup;
  }

  public get newCurrencyForm(): FormControl {
    return this?.newCurrencyGroup?.get('currency') as FormControl;
  }

  private ngUnsubscribe =  new Subject();

  constructor(
    private currencyService: CurrencyService,
    private fb: FormBuilder,) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      originCurrency: ['', Validators.required],
      originQuantity: ['', [Validators.required, this.onlyNumbersValidator]],
      calculationsList: this.fb.array([])
     })

    this.currencyService.getCurrenciesList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => { this.currencies = data });
    this.originQuantityGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.getExchangeRate());
  }

  private onlyNumbersValidator = (control: AbstractControl) => ((control && !isNaN(control.value)) ? null : {onlyNumbers: true })

  public addCurrency() {
    if(this.form.valid && this.calculationsListGroup.length < this.currencies.length) {
      this.form.addControl('newCurrency', this.fb.group({
        currency: ['', Validators.required],
        quantity: [{value: '', disabled: true}],
        })
      )}
  }

  public onChange() {
    if(this.newCurrencyGroup) {
      this.calculationsListGroup.push(this.newCurrencyGroup);
      this.form.removeControl('newCurrency');
    }
    this.getExchangeRate();
  }

  public getExchangeRate() {
    this.currencyService.getCurrenciesList(this.originCurrencyGroup.value)
    .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => this.calculateResult(data));
  }

  private calculateResult(data: IdValue[]) {
    this.calculationsListGroup.controls.forEach(control => {
      const currency = control.get('currency').value;

      if(!currency){
        return;
      }

      const originQuantity = this.originQuantityGroup.value;
      const currencyValue = data.find(key => key.id == currency)?.value;

      const result = (currency === this.originCurrencyGroup.value)
      ? originQuantity
      : (currencyValue * originQuantity).toFixed(2);

      control.setValue({currency: currency, quantity: result})
    })
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
