import {
  ITreeViewItem,
  TreeViewItemState
} from './tree-view-item.interface';
import { ITreeViewItemSource } from './tree-view-item-source.interface';

export interface ITreeViewService {

  getBranch(id: any): ITreeViewItem; // Получить информацию о разделе

  changeState(item: ITreeViewItem, state: TreeViewItemState): void; // изменить состояние выделения раздела с переданным id
  unfold(item: ITreeViewItem): void; // Развернуть раздел с переданным id
  collapse(item: ITreeViewItem): void; // Свернуть раздел с переданным id

  unfoldAll(): void; // Развернуть всё
  collapseAll(): void; // Свернуть всё

  showSelectedOnly(filter?: boolean): void; // Показывать только выбранные
  showAll(): void; // Показывать только выбранные
  selectAll(): void; // Выбрать все узлы
  deselectAll(): void; // Снять выбор со всех узлов

  reset(): void; // Сбросить выделение и свернуть все разделы

  getSelectedIds(): any[]; // Получить ID выделенных разделов
  getSelectedItems(): ITreeViewItemSource[]; // Получить экземпляры объектов с исходными данными о выделенных разделах

  restoreSelectedIds(ids: any[]): void; // Восстановить состояние выделенных разделов по списку ID
  restoreSelectedItems(items: ITreeViewItemSource[]): void; // Восстановить состояние выделенных разделов

}
