import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-validation-messages',
  templateUrl: './validation-messages.component.html',
  styleUrls: ['./validation-messages.component.scss']
})
export class ValidationMessagesComponent {
  @Input() control: FormControl;
  @Input() fieldName: string = 'Value'

  public get errorMessage() {
    for (const error in this.control.errors) {
      if (this.control.touched || !this.control.pristine) {
        switch(error) {
          case 'required':
            return `${this.fieldName} is required`;
          case 'onlyNumbers':
            return 'Only numbers allowed';
          default:
            return null;
        }
      }
    }
    return null;
  }

}
