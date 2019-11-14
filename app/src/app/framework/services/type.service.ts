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

import { Injectable } from '@angular/core';
import { CmdbType } from '../models/cmdb-type';
import { ApiCallService, ApiService } from '../../services/api-call.service';
import { Observable, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { UserService } from '../../management/services/user.service';

export const checkTypeExistsValidator = (typeService: TypeService<CmdbType>, time: number = 500) => {
  return (control: FormControl) => {
    return timer(time).pipe(switchMap(() => {
      return typeService.checkTypeExists(control.value).pipe(
        map(() => {
          return { typeExists: true };
        }),
        catchError(() => {
          return new Promise(resolve => {
            resolve(null);
          });
        })
      );
    }));
  };
};

@Injectable({
  providedIn: 'root'
})
export class TypeService<T = CmdbType> implements ApiService {

  public servicePrefix: string = 'type';
  private typeList: T[];

  constructor(private api: ApiCallService) {
    // STRUCTURE IS DEPRECATED PLEASE NOT USE
    this.getTypeList().subscribe((respTypeList: T[]) => {
      this.typeList = respTypeList;
    });
  }

  public findType(publicID: number): T {
    // FUNCTION IS DEPRECATED PLEASE NOT USE
    // @ts-ignore
    return this.typeList.find(id => id.public_id === publicID);
  }

  public getType(publicID: number): Observable<T[]> {
    return this.api.callGet<CmdbType>(this.servicePrefix + '/' + publicID).pipe(
      map((apiResponse) => {
        return apiResponse.body;
      })
    );
  }

  public getTypeList(): Observable<T[]> {
    return this.api.callGet<CmdbType[]>(this.servicePrefix + '/').pipe(
      map((apiResponse) => {
        return apiResponse.body;
      })
    );
  }

  public postType(typeInstance: CmdbType): Observable<any> {
    return this.api.callPost<T>(this.servicePrefix + '/', typeInstance).pipe(
      map((apiResponse) => {
        return apiResponse.body;
      })
    );
  }

  public putType(typeInstance: CmdbType): Observable<any> {
    return this.api.callPut<T>(this.servicePrefix + '/', typeInstance).pipe(
      map((apiResponse) => {
        return apiResponse.body;
      })
    );
  }

  public deleteType(publicID: number): Observable<any> {
    return this.api.callDelete<number>(this.servicePrefix + '/' + publicID).pipe(
      map((apiResponse) => {
        return apiResponse.body;
      })
    );
  }

  public getTypeListByCategory(publicID: number): Observable<any> {
    return this.api.callGet<T[]>(this.servicePrefix + '/category/' + publicID).pipe(
      map((apiResponse) => {
        return apiResponse.body;
      })
    );
  }

  public updateTypeByCategoryID(publicID: number): Observable<any> {
    return this.api.callPut<T>(this.servicePrefix + '/category/' + publicID, null).pipe(
      map((apiResponse) => {
        return apiResponse.body;
      })
    );
  }

  public cleanupRemovedFields(publicID: number): Observable<any> {
    return this.api.callGetRoute(this.servicePrefix + '/cleanup/remove/' + publicID).pipe(
      map((apiResponse) => {
        return apiResponse.body;
      })
    );
  }

  public cleanupInsertedFields(publicID: number): Observable<any> {
    return this.api.callGetRoute(this.servicePrefix + '/cleanup/update/' + publicID).pipe(
      map((apiResponse) => {
        return apiResponse.body;
      })
    );
  }

  // Validation functions
  public checkTypeExists(typeName: string) {
    return this.api.callGet<T>(`${ this.servicePrefix }/${ typeName }`);
  }

  public async validateTypeName(name: string) {
    // FUNCTION IS DEPRECATED PLEASE NOT USE
    // @ts-ignore
    return this.typeList.find(type => type.name === name) === undefined;
  }

}

