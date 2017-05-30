import { ITreeViewService } from './tree-view-service.interface';
import { Injectable } from '@angular/core';
import {
  ITreeViewItem,
  TreeViewItemState
} from './tree-view-item.interface';
import { ITreeViewItemSource } from './tree-view-item-source.interface';
import { ITreeViewMap } from './tree-view-map.interface';
import { TreeViewItem } from './tree-view-item.model';
import { Observable } from 'rxjs';

@Injectable()
export abstract class TreeViewService implements ITreeViewService {

  protected static ROOT_ID    = 'jAQrOdJvjUlZbBhGskXB';
  protected static rootParams =
                     {
                       parent:         null,
                       state:          TreeViewItemState.Deselected,
                       unfolded:       true,
                       children:       null,
                       hasChildren:    true,
                       show:           true,
                       unfoldChildren: false,
                     };

  protected static FakeRootSource = class {
    id          = null;
    hasChildren = true;
    selectable  = false;

    getLabel(): string {
      return '';
    }
  };

  protected MAX_REQUESTS = 3;

  protected itemsMap: ITreeViewMap               = {};
  protected selectionQueue: any[]                = [];
  protected awaitingIdsQueue: any[]              = [];
  protected getChildrenQueue: ITreeViewItem[]    = [];
  protected getChildrenRequests: ITreeViewItem[] = [];
  protected filterSelectedOnly: boolean          = false;

  constructor() {
  }

  /***
   *  Получить информацию о разделе по id
   *
   */
  public getBranch(id: any = null): ITreeViewItem {
    return id === null ? this.getOrCreateRoot() : this.itemsMap[id];
  };

  /***
   *  Изменить состояние выделения раздела с переданным id
   */
  public changeState(branch: ITreeViewItem, state: TreeViewItemState): void {
    if (branch &&
        // branch.selectable &&
        (state === TreeViewItemState.Selected || state === TreeViewItemState.Deselected)) {

      this._changeState(branch, state);
    }
  };

  /***
   *  Развернуть переданный раздел
   */
  public unfold(branch: ITreeViewItem): void {
    if (branch) {
      this.unfold(branch.parent);

      if (branch.hasChildren && branch.children === null) {
        this.getChildren(branch);
      } else {
        branch.unfoldChildren = false;
      }

      branch.unfolded = true;
    }
  };

  /***
   *  Свернуть переданный раздел
   */
  public collapse(branch: ITreeViewItem): void {
    if (branch) {

      if (branch !== this.getBranch(TreeViewService.ROOT_ID))
        branch.unfolded = false;

      if (branch.children)
        branch.children.forEach((child) => {
          this.collapse(child);
        });
    }
  };

  /***
   *  Развернуть всё
   */
  public unfoldAll(): void {
    for (let id in this.itemsMap) {
      this.getBranch(id).unfoldChildren = true;
      this.unfold(this.getBranch(id));
    }
  };

  /***
   *  Свернуть всё
   */
  public collapseAll(): void {
    this.collapse(this.getBranch());
  };

  /***
   *  Показывать только выделенные
   */
  public showSelectedOnly(filter: boolean = true): void {
    let branch: ITreeViewItem;

    this.filterSelectedOnly = filter;

    for (let id in this.itemsMap) {
      branch = this.getBranch(id);

      branch.show = !(filter && branch.state === TreeViewItemState.Deselected);
    }
  };

  /***
   * Показывать всё
   */
  public showAll(): void {
    this.showSelectedOnly(false);
  }

  /***
   * Выбрать все узлы
   */
  public selectAll(): void {
    this._changeState(this.getBranch(), TreeViewItemState.Selected, false);
  }

  /***
   * Сбросить выбор со всех узлов
   */
  public deselectAll(): void {
    this._changeState(this.getBranch(), TreeViewItemState.Deselected, false);
  }

  /***
   *  Сбросить выделение и свернуть все разделы
   */
  public reset(): void {
    this.collapseAll();
    this.deselectAll();
    this.showAll();
  };

  /***
   *  Получить ID выделенных разделов
   */
  public getSelectedIds(): any[] {
    return this.getSelected();
  };

  /***
   *  Получить экземпляры объектов с исходными данными о выделенных разделах
   */
  public getSelectedItems(): ITreeViewItemSource[] {
    return this.getSelected(false);
  };

  /***
   *  Восстановить выделение разделов по списку ID
   */
  public restoreSelectedIds(ids: any[]): void {
    ids.forEach((id) => {
      let branch = this.getBranch(id);

      if (branch) {
        this.changeState(branch, TreeViewItemState.Selected);
      } else {

        this.selectionQueue.push(id);

        this.retrieveParentsIds(id)
            .subscribe((parentsIds) => {

              parentsIds.forEach((parentId) => {
                let parent = this.getBranch(parentId);

                if (parent) {
                  this.getChildren(parent);
                } else {
                  this.awaitingIdsQueue.push(id);
                }

              });

            });
      }
    });
  };

  /***
   *  Восстановить выделение разделов по списку экземпляров объектов с исходными данными
   */
  public restoreSelectedItems(items: ITreeViewItemSource[]): void {
    let ids = items.map((item) => {
      return item.id;
    });

    this.restoreSelectedIds(ids);
  };

  /***
   * Получить от backend непосредственные подразделы раздела с соответствующим id
   *
   * @param branch
   */
  protected abstract retrieveChildren(branch: ITreeViewItem): Observable<ITreeViewItemSource[]>;

  /***
   * Получить список вышестоящих id в порядке от выше- к нижележащим
   *
   * @param id
   */
  protected abstract retrieveParentsIds(id: any): Observable<any[]>;

  /***
   *
   * @param branch
   * @param newState
   * @param recalculateParent
   * @private
   */
  protected _changeState(branch: ITreeViewItem, newState: TreeViewItemState, recalculateParent = true): void {
    if (branch) {
      branch.state = newState;
      branch.show  = !(this.filterSelectedOnly && branch.state === TreeViewItemState.Deselected);

      switch (true) {
        case branch.children === null && newState === TreeViewItemState.Selected:
          this.getChildren(branch);
          break;

        case branch.children.length > 0:
          branch.children.forEach((child) => {
            this._changeState(child, newState, false);
          });
          break;

        default:
      }

      if (recalculateParent)
        this.recalculateParentsState(branch);
    }
  }

  protected recalculateParentsState(branch: ITreeViewItem): void {
    if (branch && branch.parent && branch.parent.id !== TreeViewService.ROOT_ID) {
      let newState: TreeViewItemState;

      let selectedChildren  = 0;
      let partiallyChildren = 0;

      branch.parent.children.forEach((child) => {
        switch (child.state) {
          case TreeViewItemState.Selected:
            selectedChildren++;
            break;
          case TreeViewItemState.Deselected:
            break;
          default:
            partiallyChildren++;
        }
      });

      switch (true) {
        case partiallyChildren > 0 || (selectedChildren > 0 && selectedChildren < branch.parent.children.length):
          newState = TreeViewItemState.Partially;
          break;

        case branch.parent.children.length === selectedChildren:
          newState = TreeViewItemState.Selected;
          break;

        default:
          newState = TreeViewItemState.Deselected;
          break;
      }

      branch.parent.state = newState;
      this.recalculateParentsState(branch.parent);
    }
  }

  /***
   * Получение корня дерева: т.к. корневая ветка должна быть одна,
   * по умолчанию создаётся искусственный невидимый корень.
   *
   * При необходимости эту функцию можно переопределить в реализации сервиса
   * и получить корневой раздел от backend.
   */
  protected getOrCreateRoot(): ITreeViewItem {

    if (!this.itemsMap.hasOwnProperty(TreeViewService.ROOT_ID)) {
      let root                               = new TreeViewItem(new TreeViewService.FakeRootSource(), TreeViewService.rootParams);
      this.itemsMap[TreeViewService.ROOT_ID] = root;
      this.unfold(root);
    }

    return this.itemsMap[TreeViewService.ROOT_ID];
  }

  /***
   * Обработать очередь запросов на получение подразделов
   */
  protected proceedGetQueue(): void {

    if (this.getChildrenRequests.length < this.MAX_REQUESTS && this.getChildrenQueue.length > 0) {

      let parent = this.getChildrenQueue.shift();

      this.getChildrenRequests.push(parent);

      parent.isRequesting = true;

      this.retrieveChildren(parent)
          .subscribe(
            (sourceItems) => {

              parent.children =
                sourceItems.map((sourceItem) => {
                  return this.buildBranch(sourceItem, parent);
                });

              parent.unfoldChildren = false;

            },
            (err) => {
              console.log(`Got error while retrieving children of node with id '${parent.id}'.`, err);
            },
            () => {
              let indx = this.getChildrenRequests.indexOf(parent);

              if (indx > -1)
                this.getChildrenRequests.splice(indx, 1);

              parent.isRequesting = false;

              this.proceedGetQueue();
            });
    }
  }

  /***
   * Запрашивает потомков
   *
   * @param parent
   */
  protected getChildren(parent: ITreeViewItem): void {

    if (parent &&
        parent.hasChildren &&
        parent.children === null &&
        this.getChildrenQueue.indexOf(parent) < 0 &&
        this.getChildrenRequests.indexOf(parent) < 0
    ) {
      this.getChildrenQueue.push(parent);
      this.proceedGetQueue();
    }
  }

  protected buildBranch(sourceItem: ITreeViewItemSource, parent: ITreeViewItem): ITreeViewItem {

    let branch = new TreeViewItem(sourceItem, {parent: parent});

    this.itemsMap[branch.id] = branch;


    let selectionIndex = this.selectionQueue.indexOf(branch.id);

    if (parent.state === TreeViewItemState.Selected || selectionIndex > -1) {
      this._changeState(branch, TreeViewItemState.Selected, false);

      if(selectionIndex > -1)
        this.selectionQueue.splice(selectionIndex, 1);
    }

    if (parent.unfoldChildren)
      this.unfold(branch);


    let awaitingIndex = this.awaitingIdsQueue.indexOf(branch.id);

    if(awaitingIndex > -1) {
      this.awaitingIdsQueue.splice(awaitingIndex, 1);
      this.getChildren(branch);
    }

    return branch;
  }

  protected getSelected(idsOnly = true) {
    let items = [];
    let ids   = [];

    for (let id in this.itemsMap) {
      let item = this.itemsMap[id];

      if (item.selectable && item.state === TreeViewItemState.Selected) {
        items.push(item.sourceItem);
        ids.push(item.id);
      }
    }

    return idsOnly ? ids : items;
  }
}
