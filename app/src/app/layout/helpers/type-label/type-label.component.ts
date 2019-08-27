/*
* DATAGERRY - OpenSource Enterprise CMDB
* Copyright (C) 2019 NETHINKS GmbH
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.

* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Component, Input, OnInit } from '@angular/core';
import { CmdbType } from '../../../framework/models/cmdb-type';

@Component({
  selector: 'cmdb-type-label',
  templateUrl: './type-label.component.html',
  styleUrls: ['./type-label.component.scss']
})
export class TypeLabelComponent implements OnInit {

  public label: string;
  public icon: string;
  private type: CmdbType;

  ngOnInit() {
  }

  @Input()
  public set typeInstance(value: CmdbType) {
    this.type = value;
  }

  public get typeInstance(): CmdbType {
    return this.type;
  }

  @Input()
  public set title(value: string) {
    this.label = value === undefined ? '' : value;
  }

  public get title(): string {
    return this.label;
  }

  @Input()
  public set faIcon(value: string) {
    this.icon = value === undefined ? 'fa-cube' : value;
  }

  public get faIcon(): string {
    return this.icon;
  }
}