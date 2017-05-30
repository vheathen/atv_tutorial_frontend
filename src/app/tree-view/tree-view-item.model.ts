import {
  ITreeViewItem,
  TreeViewItemState
} from './tree-view-item.interface';
import { ITreeViewItemSource } from './tree-view-item-source.interface';

export class TreeViewItem implements ITreeViewItem {

  public id: any;

  public state: TreeViewItemState;
  public unfolded: boolean;
  public show: boolean;
  public selectable: boolean;

  public hasChildren: boolean; // есть подразделы?

  public children: ITreeViewItem[]; // список подразделов
  public parent: ITreeViewItem; // основной родительский раздел

  public unfoldChildren: boolean; // развернуть подразделы?

  public isRequesting: boolean = false; // отправлен ли запрос на получение потомков?

  public sourceItem: ITreeViewItemSource; // исходный объект

  public get label(): string {
    return this.sourceItem.getLabel();
  };

  constructor(sourceItem: ITreeViewItemSource,
              {
                state = TreeViewItemState.Deselected,
                unfolded = false,
                show = true,
                children = undefined,
                parent = null,
                unfoldChildren
              }: {
                state?: TreeViewItemState,
                unfolded?: boolean,
                show?: boolean,
                children?: ITreeViewItem[]
                parent?: ITreeViewItem,
                unfoldChildren?: boolean,
              } = {}) {
    this.sourceItem = sourceItem;

    this.id = sourceItem.id;
    this.hasChildren = sourceItem.hasChildren;
    this.selectable = sourceItem.selectable;

    this.children = children !== undefined ?
                    children
                    : this.hasChildren ? null : [];

    this.state = state;
    this.unfolded = unfolded;
    this.show = show;
    this.parent = parent;
    this.unfoldChildren = unfoldChildren ? unfoldChildren : (false && parent && parent.unfoldChildren);
  }
}
