import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TreeViewService } from '../tree-view.service';
import { ITreeViewItemSource } from '../tree-view-item-source.interface';
import { TreeViewTestDict } from './tree-view-test-dict';
import { TreeViewItemTestSource } from './tree-view-item-test-source.model';
import { ITreeViewItem } from '../tree-view-item.interface';

@Injectable()
export class TreeViewTestService extends TreeViewService {

  protected retrieveChildren(branch: ITreeViewItem): Observable<ITreeViewItemSource[]> {
    return new Observable<any>(
      (observer) => {
        let source = branch.parent === null ?
                     TreeViewTestDict.GetRootSource() :
                     TreeViewTestDict.GetChildrenSource(branch.id);

        let children = source.map((child) => {
          return new TreeViewItemTestSource(child);
        });

        observer.next(children);
        observer.complete();
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
