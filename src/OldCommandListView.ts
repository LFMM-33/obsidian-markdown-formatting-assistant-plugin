import { App, Editor } from 'obsidian';
import { svgToElement } from './icons';
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

export class CommandListView {
  private static commandListView: CommandListView;
  private static oldCurser: CodeMirror.Position;
  private readonly app: App;
  private cm: Editor;
  private codeString: string;
  private startIndex: number;
  private endIndex: number;
  private rows: Array<HTMLElement> = [];
  private selectetRowId: string = null;
  private visible: boolean = false;
  private keyDownHandler: (cf: CodeMirror.Editor, e: KeyboardEvent) => boolean;

  constructor(
    app: App,
    cm: Editor,
    startIndex: number,
    endIndex: number,
  ) {
    this.app = app;
    this.cm = cm;

    const curser = cm.getCursor();
    const line = cm.getLine(curser.line);

    this.startIndex = startIndex;
    this.endIndex = endIndex;
    this.codeString = line.substring(
      startIndex + 1,
      endIndex >= 0 ? endIndex : undefined,
    );

    this.keyDownHandler = (cf: CodeMirror.Editor, e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.changeRowSelected(e.key === 'ArrowUp' ? -1 : 1);

        return false;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const rowIndex = this.rows.findIndex(
          (r) => r.id === this.selectetRowId,
        );
        if (rowIndex >= 0 && this.rows.length > rowIndex) {
          this.rows[rowIndex].click();
        }

        return false;
      }
    };

    cm.on('keydown', this.keyDownHandler);
  }

  public static display(
    app: App,
    cm: Editor,
    event: KeyboardEvent,
    triggerKey: string,
  ) {
    this.oldCurser = cm.getCursor();

    if (['Enter', 'ArrowUp', 'ArrowDown'].contains(event.key)) {
      return false;
    }

    if (this.commandListView) this.commandListView.close();

    if (['Escape'].contains(event.key)) {
      return false;
    }

    const curser = cm.getCursor();
    if (!curser) return;
    const line = cm.getLine(curser.line);
    if (!line) return;
    let startIndex = line.indexOf(triggerKey);

    while (startIndex >= 0) {
      const endIndex = line.split('$').join(' ').indexOf(' ', startIndex);

      if (curser.ch >= startIndex && (endIndex < 0 || curser.ch <= endIndex)) {
        if (this.commandListView) this.commandListView.close();
        this.commandListView = new CommandListView(
          app,
          cm,
          startIndex,
          endIndex,
        );
        this.commandListView.display();

        break;
      } else {
        if (this.commandListView) this.commandListView.close();
      }
      startIndex = line.indexOf(triggerKey, startIndex + 1);
    }
  }

  public display = (): void => {
    this.cm.addWidget(this.cm.getCursor(), this.getWidgetView(), true);
  };

  public readonly close = (): void => {
    const el = document.getElementById('CommandListViewRootWidget');
    if (el) {
      el.parentNode.removeChild(el);
      CommandListView.commandListView = null;
      this.cm.off('keydown', this.keyDownHandler);
    }
    
  };

  private getWidgetView = (): HTMLElement => {
    const root = document.createElement('div');
    root.id = 'CommandListViewRootWidget';
    root.classList.add('widget-background');
    root.style.display = 'inline-block';
    root.style.zIndex = '300';

    const table = root.createEl('table');
    table.classList.add('command-list-view-table');
    const tbody = table.createEl('tbody');

    this.rows = [];
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

  private getWidgetViewTextEditTableRow = (
    item: formatterSetting,
  ): HTMLElement => {
    const row = document.createElement('tr');
    row.id = item.des;

    row.onClickEvent(() => {
      this.cm.getCursor();
      this.cm.replaceRange(
        '',
        { line: this.cm.getCursor().line, ch: this.startIndex },
        {
          line: this.cm.getCursor().line,
          ch: this.endIndex >= 0 ? this.endIndex : this.cm.getCursor().ch,
        },
      );

      iconFormatter(this.cm, item);
      this.close();
      // this.cm.focus();
      // this.cm.setCursor({
      //   line: this.cm.getCursor().line,
      //   ch: this.startIndex + item.shift,
      // });
    });

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

    row.onClickEvent(() => {
      this.cm.getCursor();
      this.cm.replaceRange(
        '',
        { line: this.cm.getCursor().line, ch: this.startIndex },
        {
          line: this.cm.getCursor().line,
          ch: this.endIndex >= 0 ? this.endIndex : this.cm.getCursor().ch,
        },
      );

      htmlFormatter(this.cm, item);
      this.close();
    });

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

    row.onClickEvent(() => {
      this.cm.getCursor();
      this.cm.replaceRange(
        '',
        { line: this.cm.getCursor().line, ch: this.startIndex },
        {
          line: this.cm.getCursor().line,
          ch: this.endIndex >= 0 ? this.endIndex : this.cm.getCursor().ch,
        },
      );

      greekFormatter(this.cm, item);
      this.close();
    });

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

    row.onClickEvent(() => {
      this.cm.getCursor();
      this.cm.replaceRange(
        '',
        { line: this.cm.getCursor().line, ch: this.startIndex },
        {
          line: this.cm.getCursor().line,
          ch: this.endIndex >= 0 ? this.endIndex : this.cm.getCursor().ch,
        },
      );

      latexFormatter(this.cm, item);
      this.close();
    });

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
}
