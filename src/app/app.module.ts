import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

import { AlertModule } from 'ng2-bootstrap';
import TreeNodeComponent from './tree-view/tree-node.component';
import { TreeViewTestService } from './tree-view/testing/tree-view-test.service';
import { GrntiService } from './grnti.service';

@NgModule({
  declarations: [
    AppComponent,
    TreeNodeComponent,
  ],
  imports: [
    AlertModule.forRoot(),
    BrowserModule,
    FormsModule,
    HttpModule,
  ],
  providers: [GrntiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
