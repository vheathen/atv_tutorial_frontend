import { ITreeViewItemSource } from './tree-view-item-source.interface';

// В случае расширения следующий элемент должен быть инициализирован значением 3
export enum TreeViewItemState {
  Deselected,
  Partially,
  Selected,
  PartiallySelected
}

export interface ITreeViewItem {
  id: any;
  label: string; // текстовая метка

  state: TreeViewItemState; // состоание выбора: PartiallySelected/Selected/Partially/Deselected (выбран/частично/не выбран)
  unfolded: boolean; // развёрнут/свёрнут
  show: boolean; // Показывать ли раздел
  selectable: boolean; // можно выбрать

  hasChildren?: boolean; // есть подразделы?
  children: ITreeViewItem[]; // список подразделов
  parent: ITreeViewItem; // основной родительский раздел
  unfoldChildren: boolean; // развернуть подразделы?

  isRequesting: boolean; // отправлен ли запрос на получение потомков?

  sourceItem: ITreeViewItemSource; // исходный объект
}
