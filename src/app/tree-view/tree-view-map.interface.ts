import { ITreeViewItem } from './tree-view-item.interface';

export interface ITreeViewMap {
  [propName: string]: ITreeViewItem;
  [propName: number]: ITreeViewItem;
}
