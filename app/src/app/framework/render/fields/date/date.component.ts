import { Component, OnInit } from '@angular/core';
import { RenderField } from '../components.fields';
import { formatDate } from '@angular/common';
import { NgbDateAdapter, NgbDateNativeAdapter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import { NgbStringAdapter } from './NgbStringAdapter';

@Component({
  selector: 'cmdb-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss'],
  providers: [{provide: NgbDateAdapter, useClass: NgbStringAdapter}]
})
export class DateComponent extends RenderField implements  OnInit {

  public constructor() {
    super();
  }

  ngOnInit(): void {
    if (this.parentFormGroup.get(this.data.name).value === '') {
      this.parentFormGroup.get(this.data.name).setValue(null, {onlySelf: true});
    }
  }

}
