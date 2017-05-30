import { ITreeViewItemSource } from '../tree-view/tree-view-item-source.interface';

export class Item implements ITreeViewItemSource {
  public id: any;
  public hasChildren: boolean;
  public selectable: boolean = true;

  protected title: string = '';

  constructor(data: any) {
    this.id    = data.id;
    this.title = data.title;
    if (data.hasOwnProperty('has_children'))
      this.hasChildren = data.has_children;

    if (data.hasOwnProperty('selectable'))
      this.selectable = data.selectable;
  }

  public getLabel(): string {
    return `${this.formatId()}: ${this.title}`;
  }

  protected formatId(): string {
    return ('000000' + this.id.toString()).substr(-6).replace(/(.{2})/g, '$1.').slice(0, -1);
  };

}
