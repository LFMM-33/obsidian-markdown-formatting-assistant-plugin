import {
    Decoration,
    DecorationSet,
    PluginSpec,
    PluginValue,
    ViewPlugin,
    ViewUpdate,
    WidgetType,
    EditorView
  } from "@codemirror/view";
  import { 
    formatSettings, 
    formatterSetting, 
    iconFormatter 
  } from './formatter';
  import {
    htmlFormatter,
    htmlFormatterSettings,
    htmlFormatterSetting,
  } from './htmlFormatter';
  import {
    greekFormatter,
    greekLowerCaseFormatterSettings,
    greekUpperCaseFormatterSettings,
    greekFormatterSetting,
  } from './greekFormatter';
  import {
    latexFormatter,
    latexFormatterSettings,
    latexFormatterSetting,
  } from './latexFormatter';
  import { svgToElement } from './icons';
import { App, Editor } from "obsidian";

/* 
Use it adding this to the Obsidian plugin

let commandPlugin = ViewPlugin.fromClass(
      CommandListPlugin,
      commandListPluginSpec
    )
    let extension1 = [dummyInput(), commandPlugin];
    let extension2 = [dummyInput()];
    this.registerEditorExtension(extension1);
*/

// WIDGET SECTION

class CommandListWidget extends WidgetType {
  private app: App;
  private rows: Array<HTMLElement> = [];
  private cm: Editor;
  private codeString: string;
  private selectetRowId: string = null;

  eq(other: CommandListWidget) { 
    return true //(??) avoids redrawing a new command list 
  }

  toDOM(view: EditorView): HTMLElement {
    const root = document.createElement('div');
    root.id = 'CommandListViewRootWidget';
    root.classList.add('widget-background');
    root.style.display = 'inline-block';
    root.style.zIndex = '300';

    const table = root.createEl('table');
    table.classList.add('command-list-view-table');
    const tbody = table.createEl('tbody');
    
    this.rows = [];
    this.codeString = "c"
    Object.values(formatSettings).map((args) => {
        if (!this.codeString || args.des.indexOf(this.codeString) >= 0) {
          // @ts-ignore
          const row = this.getWidgetViewTextEditTableRow(args);
          if (row) this.rows.push(row);
        }
    });

    Object.values(htmlFormatterSettings).map((args) => {
        if (!this.codeString || args.des.indexOf(this.codeString) >= 0) {
          // @ts-ignore
          const row = this.getWidgetViewHtmlTableRow(args);
          if (row) this.rows.push(row);
        }
    });

    Object.values(greekLowerCaseFormatterSettings).map((args) => {
        if (!this.codeString || args.des.indexOf(this.codeString) >= 0) {
          // @ts-ignore
          const row = this.getWidgetViewGreekTableRow(args);
          if (row) this.rows.push(row);
        }
    });

    Object.values(greekUpperCaseFormatterSettings).map((args) => {
        if (!this.codeString || args.des.indexOf(this.codeString) >= 0) {
          // @ts-ignore
          const row = this.getWidgetViewGreekTableRow(args);
          if (row) this.rows.push(row);
        }
    });

    Object.values(latexFormatterSettings).map((args) => {
        if (!this.codeString || args.des.indexOf(this.codeString) >= 0) {
          // @ts-ignore
          const row = this.getWidgetViewLatexTableRow(args);
          if (row) this.rows.push(row);
        }
    });

    if (this.rows.length > 0) this.setRowSelected(this.rows[0].id);

    this.rows.slice(0, 5).forEach((row) => {
        if (row) tbody.appendChild(row);
    });

    return root;
  };

  private getWidgetViewTextEditTableRow = (
      item: formatterSetting,
    ): HTMLElement => {
      const row = document.createElement('tr');
      row.id = item.des;
  
      // row.onClickEvent(() => {
      //   this.cm.getCursor();
      //   this.cm.replaceRange(
      //     '',
      //     { line: this.cm.getCursor().line, ch: this.startIndex },
      //     {
      //       line: this.cm.getCursor().line,
      //       ch: this.endIndex >= 0 ? this.endIndex : this.cm.getCursor().ch,
      //     },
      //   );
  
      //   iconFormatter(this.cm, item);
      //   this.close();
      //   // this.cm.focus();
      //   // this.cm.setCursor({
      //   //   line: this.cm.getCursor().line,
      //   //   ch: this.startIndex + item.shift,
      //   // });
      // });
  
      const cell1 = row.createEl('td');
      const iconDiv = cell1.createDiv();
      iconDiv.classList.add('command-list-view-icon');
      iconDiv.appendChild(svgToElement(item.icon));
  
      const cell2 = row.createEl('td');
      cell2.classList.add('command-list-view-text');
      cell2.setText(item.des);
  
      return row;
  };

  private getWidgetViewHtmlTableRow = (
    item: htmlFormatterSetting,
  ): HTMLElement => {
    const row = document.createElement('tr');
    row.id = item.des;

    // row.onClickEvent(() => {
    //     this.cm.getCursor();
    //     this.cm.replaceRange(
    //     '',
    //     { line: this.cm.getCursor().line, ch: this.startIndex },
    //     {
    //         line: this.cm.getCursor().line,
    //         ch: this.endIndex >= 0 ? this.endIndex : this.cm.getCursor().ch,
    //     },
    //     );

    //     htmlFormatter(this.cm, item);
    //     this.close();
    // });

    const cell1 = row.createEl('td');
    const iconDiv = cell1.createDiv();
    // iconDiv.classList.add('command-list-view-icon');
    iconDiv.appendText('HTML');

    const cell2 = row.createEl('td');
    cell2.classList.add('command-list-view-text');
    cell2.style.color = '#0055F2';
    cell2.setText(item.des);

    return row;
  };

  private getWidgetViewGreekTableRow = (
    item: greekFormatterSetting,
  ): HTMLElement => {
    const row = document.createElement('tr');
    row.id = item.des;

    // row.onClickEvent(() => {
    //   this.cm.getCursor();
    //   this.cm.replaceRange(
    //     '',
    //     { line: this.cm.getCursor().line, ch: this.startIndex },
    //     {
    //         line: this.cm.getCursor().line,
    //         ch: this.endIndex >= 0 ? this.endIndex : this.cm.getCursor().ch,
    //     },
    //   );

    //   greekFormatter(this.cm, item);
    //   this.close();
    // });

    const cell1 = row.createEl('td');
    const iconDiv = cell1.createDiv();
    iconDiv.classList.add('command-list-view-icon');
    iconDiv.appendChild(svgToElement(item.icon));

    const cell2 = row.createEl('td');
    cell2.classList.add('command-list-view-text');
    cell2.style.color = '#25e712';
    cell2.setText(item.des);

    return row;
  };

  private getWidgetViewLatexTableRow = (
    item: latexFormatterSetting,
  ): HTMLElement => {
    const row = document.createElement('tr');
    row.id = item.des;

    // row.onClickEvent(() => {
    //   this.cm.getCursor();
    //   this.cm.replaceRange(
    //     '',
    //     { line: this.cm.getCursor().line, ch: this.startIndex },
    //     {
    //         line: this.cm.getCursor().line,
    //         ch: this.endIndex >= 0 ? this.endIndex : this.cm.getCursor().ch,
    //     },
    //   );

    //   latexFormatter(this.cm, item);
    //   this.close();
    // });

    const cell1 = row.createEl('td');
    const iconDiv = cell1.createDiv();
    iconDiv.classList.add('command-list-view-icon');
    if (item.type === 'icon') {
      let svg = svgToElement(item.text);
      svg.style.display = 'inline-block';
      svg.style.verticalAlign = 'middle';
      iconDiv.appendChild(svg);
    } else if (item.type === 'text') {
      let div = document.createElement('div');
      div.innerHTML = item.text;
      iconDiv.appendChild(div);
    }

    const cell2 = row.createEl('td');
    cell2.classList.add('command-list-view-text');
    cell2.style.color = '#25e712';
    cell2.setText(item.des);

    return row;
  };

  private setRowSelected(id: string) {
    if (this.selectetRowId) {
      const row = this.rows.find((r) => r.id === this.selectetRowId);
      if (row) row.classList.remove('command-list-view-row-selected');
    }

    const row = this.rows.find((r) => r.id === id);
    if (row) row.classList.add('command-list-view-row-selected');

    this.selectetRowId = id;
  }

  private changeRowSelected(offset: number) {
    const rowIndex = this.rows.findIndex((r) => r.id === this.selectetRowId);
    if (rowIndex >= 0) {
      if (
        this.rows.length > rowIndex + offset &&
        rowIndex + offset >= 0 &&
        rowIndex + offset < 5
      ) {
        this.setRowSelected(this.rows[rowIndex + offset].id);
      } else if (rowIndex + offset >= 5 && this.rows.length > 0) {
        this.setRowSelected(this.rows[0].id);
      } else if (this.rows.length > 0) {
        const index = this.rows.length > 5 ? 4 : this.rows.length - 1;
        this.setRowSelected(this.rows[index].id);
      }
    } else if (this.rows.length > 0) {
      this.setRowSelected(this.rows[0].id);
    }
  }

}


// PLUGIN SECTION

export class CommandListPlugin implements PluginValue {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  destroy() {}

  buildDecorations(view: EditorView): DecorationSet {
    console.log("building decorations")
    let pos = view.state.selection.main.head;
    let before = view.state.doc.sliceString(Math.max(0, pos - 5), pos);
    console.log(before)
    if (before == "false") {
      let deco = Decoration.widget({widget: new CommandListWidget})
      return Decoration.set([deco.range(pos-1)]);
    } else {
      return Decoration.set([])
    }
  }
}

// Specifies how the view plugin provides the decorations 
// to the editor. Also handles dom events
export const commandListPluginSpec: PluginSpec<CommandListPlugin> = {
  decorations: (value: CommandListPlugin) => value.decorations,
};
