import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TreeViewService } from './tree-view/tree-view.service';
import { ITreeViewItem } from './tree-view/tree-view-item.interface';
import { ITreeViewItemSource } from './tree-view/tree-view-item-source.interface';
import { TreeViewTestDict } from './tree-view/testing/tree-view-test-dict';
import { TreeViewItemTestSource } from './tree-view/testing/tree-view-item-test-source.model';
import {
  Http,
  Headers
} from '@angular/http';
import { Item } from './models/item.model';

@Injectable()
export class GrntiService extends TreeViewService {

  URL = 'http://localhost:4000/api/grnti';
  protected _headers               = new Headers();

  constructor(protected http: Http) {
    super();
    this._headers.append('Content-Type', 'application/json');
  }

  protected retrieveChildren(branch: ITreeViewItem): Observable<ITreeViewItemSource[]> {
    let id = branch.parent === null ? -1 : branch.id;

    return new Observable<any>(
      (observer) => {

        this.http.get(`${this.URL}/${id}`,
                      {headers: this._headers})
            .map(res => res.json())
            .subscribe(
              (source) => {

                console.log('Source: ', source);

                let children = source.data.map((child) => {
                  return new Item(child);
                });

                observer.next(children);
                observer.complete();
              },
              (err) => {
                observer.error(err);
              }
            );

      });
  };

  protected retrieveParentsIds(id: any): Observable<any[]> {

    return new Observable<any[]>(
      (observer) => {

        let ids = [];

        let idStr = ('000000' + id.toString()).substr(-6);

        let [ all, a, b, c ] = idStr.match(/^(\d\d)(\d\d)(\d\d)$/);

        switch(true) {
          case c === '00':
            ids = [TreeViewService.ROOT_ID, parseInt(`${a}0000`, 10)];
            break;
          default:
            ids = [TreeViewService.ROOT_ID, parseInt(`${a}0000`, 10), parseInt(`${a}${b}00`, 10)];
        }

        observer.next(ids);
        observer.complete();
      }
    )
  };


}
