import {Component, Input, OnDestroy} from '@angular/core';
import { ObjectService } from '../../../services/object.service';
import { Router } from '@angular/router';
import { ApiCallService } from '../../../../services/api-call.service';
import { CmdbObject } from '../../../models/cmdb-object';
import { CmdbType } from '../../../models/cmdb-type';
import { RenderResult } from '../../../models/cmdb-render';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'cmdb-object-actions',
  templateUrl: './object-actions.component.html',
  styleUrls: ['./object-actions.component.scss']
})
export class ObjectActionsComponent implements OnDestroy {

  @Input() renderResult: RenderResult;

  constructor(private api: ApiCallService, private objectService: ObjectService,  private router: Router) {

  }
  private modalRef: NgbModalRef;

  public deleteObject(publicID: number) {
    this.modalRef = this.objectService.openModalComponent(
      'Delete Object',
      'Are you sure you want to delete this Object?',
      'Cancel',
      'Delete');

    this.modalRef.result.then((result) => {
      if (result) {
        this.api.callDelete('/object/' + publicID).subscribe((res: boolean) => {
          if (res) {
            this.router.navigate(['/']);
          }
        });
      }
    });
  }
  public ngOnDestroy(): void {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}
