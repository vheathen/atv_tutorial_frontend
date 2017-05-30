import {
  Component,
  ViewEncapsulation,
  OnInit,
  Input
} from '@angular/core';
import { ITreeViewService } from './tree-view-service.interface';
import {
  ITreeViewItem,
  TreeViewItemState
} from './tree-view-item.interface';

@Component({
             selector:      'atv-tree-node',
             templateUrl:   'tree-node.html',
             styleUrls:     ['tree-node.css'],
             encapsulation: ViewEncapsulation.None
           })
export default class TreeNodeComponent implements OnInit {
  @Input() srv: ITreeViewService;

  @Input() id: any          = null;
  @Input() level: number    = 0;
  @Input() maxLevel: number = 10000000;

  private branch: ITreeViewItem;

  ngOnInit() {
    this.branch = this.srv.getBranch(this.id);
  }

  unfold(): void {
    this.srv.unfold(this.branch);
  };

  collapse(): void {
    this.srv.collapse(this.branch);
  };

  select(): void {
    this.srv.changeState(this.branch, TreeViewItemState.Selected);
  }

  deselect(): void {
    this.srv.changeState(this.branch, TreeViewItemState.Deselected);
  }

  isCollapsed(): boolean {
    return !this.branch.isRequesting &&
           !this.branch.unfolded &&
           (!this.branch.children || this.branch.children.length > 0) &&
           this.level < this.maxLevel;
  }

  isUnfolded(): boolean {
    return !this.branch.isRequesting &&
           this.branch.unfolded &&
           this.level < this.maxLevel;
  }

  isDeselected(): boolean {
    return this.branch.state === TreeViewItemState.Deselected
  }

  isPartially(): boolean {
    return this.branch.state === TreeViewItemState.Partially;
  }

  isSelected(): boolean {
    return this.branch.state === TreeViewItemState.Selected;
  }

}
