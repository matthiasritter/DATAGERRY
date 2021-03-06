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
import { ApiCallService, ApiService, resp } from '../../services/api-call.service';
import { ValidatorService } from '../../services/validator.service';
import { CmdbObject } from '../models/cmdb-object';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs/operators';
import { RenderResult } from '../models/cmdb-render';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { DataTableFilter, DataTablesResult } from '../models/cmdb-datatable';
import { GeneralModalComponent } from '../../layout/helpers/modals/general-modal/general-modal.component';

export const httpObserveOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  }),
  observe: resp
};

export const PARAMETER = 'params';
export const FILTER = 'filter';
export const COOCKIENAME = 'onlyActiveObjCookie';

@Injectable({
  providedIn: 'root'
})

export class ObjectService<T = RenderResult> implements ApiService {

  public servicePrefix: string = 'object';

  constructor(private api: ApiCallService, private http: HttpClient, private modalService: NgbModal) {
  }

  // Find calls
  public getObjects(typeID: number, filter: DataTableFilter): Observable<T[]> {
    httpObserveOptions[PARAMETER] = { onlyActiveObjCookie: this.api.readCookies(COOCKIENAME) };
    httpObserveOptions[PARAMETER].start = filter.start;
    httpObserveOptions[PARAMETER].length = filter.length;
    httpObserveOptions[PARAMETER].order = filter.orderBy;
    httpObserveOptions[PARAMETER].direction = filter.direction;
    httpObserveOptions[FILTER] = filter;
    if (typeID != null) {
      return this.api.callGet<T[]>(`${this.servicePrefix}/dt/type/${typeID}`, httpObserveOptions).pipe(
        map((apiResponse) => {
          if (apiResponse.status === 204) {
            return [];
          }
          return apiResponse.body;
        })
      );
    }

    return this.api.callGet<T[]>(`${this.servicePrefix}/`, httpObserveOptions).pipe(
      map((apiResponse) => {
        return apiResponse.body;
      })
    );
  }

  public getObjectsByType(typeID: number): Observable<T[]> {
    httpObserveOptions[PARAMETER] = { onlyActiveObjCookie: this.api.readCookies(COOCKIENAME) };
    return this.api.callGet<T[]>(`${this.servicePrefix}/type/${typeID}`, httpObserveOptions).pipe(
      map((apiResponse) => {
        if (apiResponse.status === 204) {
          return [];
        }
        return apiResponse.body;
      })
    );
  }

  public getObject<R>(publicID: number, native: boolean = false): Observable<R> {
    if (native === true) {
      return this.api.callGet<CmdbObject[]>(`${this.servicePrefix}/${publicID}/native/`).pipe(
        map((apiResponse) => {
          return apiResponse.body;
        })
      );
    }
    return this.api.callGet<R[]>(`${this.servicePrefix}/${publicID}/`).pipe(
      map((apiResponse) => {
        return apiResponse.body;
      })
    );
  }

  // CRUD calls
  public postObject(objectInstance: CmdbObject): Observable<any> {
    return this.api.callPost<CmdbObject>(this.servicePrefix + '/', objectInstance).pipe(
      map((apiResponse) => {
        return apiResponse.body;
      })
    );
  }

  public putObject(publicID: number, objectInstance: CmdbObject, options?): Observable<any> {
    return this.api.callPut<CmdbObject>(`${this.servicePrefix}/${publicID}/`, objectInstance);
  }

  public changeState(publicID: number, status: boolean) {
    return this.api.callPut<boolean>(`${this.servicePrefix}/${publicID}/state/`, status).pipe(
      map((apiResponse) => {
        return apiResponse.body;
      })
    );
  }

  public  deleteManyObjects(publicID: any) {
    return this.api.callDeleteManyRoute(`${this.servicePrefix}/delete/${publicID}`).pipe(
      map((apiResponse) => {
        if (apiResponse.status === 204) {
          return [];
        }
        return apiResponse.body;
      })
    );
  }

  public deleteObject(publicID: any): Observable<any> {
    return this.api.callDelete(`${this.servicePrefix}/${publicID}`);
  }

  // Count calls

  public countObjectsByType(typeID: number) {
    httpObserveOptions[PARAMETER] = { onlyActiveObjCookie: this.api.readCookies(COOCKIENAME) };
    return this.api.callGet<number>(this.servicePrefix + '/count/' + typeID, httpObserveOptions).pipe(
      map((apiResponse) => {
        if (apiResponse.status === 204) {
          return [];
        }
        return apiResponse.body;
      })
    );
  }

  public groupObjectsByType(value: string, params?: any) {
    httpObserveOptions[PARAMETER] = { onlyActiveObjCookie: this.api.readCookies(COOCKIENAME) };
    return this.api.callGet<any>(this.servicePrefix + '/group/' + value, httpObserveOptions).pipe(
      map((apiResponse) => {
        if (apiResponse.status === 204) {
          return [];
        }
        return apiResponse.body;
      })
    );
  }

  public countObjects() {
    httpObserveOptions[PARAMETER] = { onlyActiveObjCookie: this.api.readCookies(COOCKIENAME) };
    return this.api.callGet<number>(`${this.servicePrefix}/count/`, httpObserveOptions).pipe(
      map((apiResponse) => {
        if (apiResponse.status === 204) {
          return [];
        }
        return apiResponse.body;
      })
    );
  }

  // Custom calls
  public getObjectReferences(publicID: number) {
    httpObserveOptions[PARAMETER] = { onlyActiveObjCookie: this.api.readCookies(COOCKIENAME) };
    return this.api.callGet<RenderResult[]>(`${this.servicePrefix}/reference/${publicID}`, httpObserveOptions).pipe(
      map((apiResponse) => {
        if (apiResponse.status === 204) {
          return [];
        }
        return apiResponse.body;
      })
    );
  }

  public getObjectsByUser(publicID: number) {
    return this.api.callGet<RenderResult[]>(`${this.servicePrefix}/user/${publicID}`).pipe(
      map((apiResponse) => {
        if (apiResponse.status === 204) {
          return [];
        }
        return apiResponse.body;
      })
    );
  }

  public getNewObjectsSince(timestamp: number) {
    return this.api.callGet<RenderResult[]>(`${this.servicePrefix}/user/new/${timestamp}`).pipe(
      map((apiResponse) => {
        if (apiResponse.status === 204) {
          return [];
        }
        return apiResponse.body;
      })
    );
  }

  public getChangedObjectsSince(timestamp: number) {
    return this.api.callGet<RenderResult[]>(`${this.servicePrefix}/user/changed/${timestamp}`).pipe(
      map((apiResponse) => {
        if (apiResponse.status === 204) {
          return [];
        }
        return apiResponse.body;
      })
    );
  }

  public getObjectsByFilter(typeID: number, filter: DataTableFilter) {
    httpObserveOptions[PARAMETER] = { onlyActiveObjCookie: this.api.readCookies(COOCKIENAME) };
    httpObserveOptions[PARAMETER].start = filter.start;
    httpObserveOptions[PARAMETER].length = filter.length;
    httpObserveOptions[PARAMETER].order = filter.orderBy;
    httpObserveOptions[PARAMETER].direction = filter.direction;
    httpObserveOptions[PARAMETER].search = ValidatorService.validateRegex(filter.search).trim();
    httpObserveOptions[PARAMETER].dtRender = filter.dtRender;
    httpObserveOptions[PARAMETER].idList = filter.idList;
    return this.api.callGet<DataTablesResult[]>(`${this.servicePrefix}/dt/filter/type/${typeID}`, httpObserveOptions).pipe(
      map((apiResponse) => {
        if (apiResponse.status === 204) {
          return [];
        }
        return apiResponse.body;
      })
    );
  }

  public cleanupRemovedFields(publicID: number): Observable<any> {
    return this.api.callGet(this.servicePrefix + '/cleanup/remove/' + publicID).pipe(
      map((apiResponse) => {
        if (apiResponse.status === 204) {
          return [];
        }
        return apiResponse.body;
      })
    );
  }

  public cleanupInsertedFields(publicID: number): Observable<any> {
    return this.api.callGet(this.servicePrefix + '/cleanup/update/' + publicID).pipe(
      map((apiResponse) => {
        if (apiResponse.status === 204) {
          return [];
        }
        return apiResponse.body;
      })
    );
  }

  public openModalComponent(title: string,
                            modalMessage: string,
                            buttonDeny: string,
                            buttonAccept: string) {

    const modalComponent = this.modalService.open(GeneralModalComponent);
    modalComponent.componentInstance.title = title;
    modalComponent.componentInstance.modalMessage = modalMessage;
    modalComponent.componentInstance.buttonDeny = buttonDeny;
    modalComponent.componentInstance.buttonAccept = buttonAccept;
    return modalComponent;
  }
}
