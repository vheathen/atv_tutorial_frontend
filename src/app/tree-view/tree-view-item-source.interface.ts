// Описание интерфейса класса для хранения
// минимальное необходимых исходных данных о подразделе
export interface ITreeViewItemSource {
  id: any;
  hasChildren: boolean;
  selectable: boolean;

  getLabel(): string;
}
