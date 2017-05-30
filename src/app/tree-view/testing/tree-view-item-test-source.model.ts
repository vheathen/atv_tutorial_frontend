import { ITreeViewItemSource } from '../tree-view-item-source.interface';

export class TreeViewItemTestSource implements ITreeViewItemSource {
  public id: any;
  public hasChildren: boolean;
  public selectable: boolean = true;

  protected title: string = '';

  constructor(data: any) {
    this.id    = data.id;
    this.title = data.title;
    if (data.hasOwnProperty('has_children'))
      this.hasChildren = data.has_children;
  }

  public getLabel(): string {
    return this.title;
  }
}
