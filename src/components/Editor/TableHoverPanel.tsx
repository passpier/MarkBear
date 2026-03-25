import type { RefObject, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import type { Editor } from '@tiptap/react';
import {
  insertRowAbove,
  insertRowBelow,
  deleteRow,
  insertColumnLeft,
  insertColumnRight,
  deleteColumn,
  deleteTable,
} from '@/lib/tableCommands';

interface ColumnInfo {
  index: number;
  left: number;
  width: number;
  cell: HTMLTableCellElement;
}

interface RowInfo {
  index: number;
  top: number;
  height: number;
  row: HTMLTableRowElement;
}

interface TableLayout {
  table: HTMLTableElement;
  top: number;
  left: number;
  width: number;
  height: number;
  columns: ColumnInfo[];
  rows: RowInfo[];
}

interface TableHoverPanelProps {
  editor: Editor | null;
  containerRef: RefObject<HTMLDivElement>;
}

const GRIP = 14;

export function TableHoverPanel({ editor, containerRef }: TableHoverPanelProps) {
  const { t } = useTranslation();
  const [layout, setLayout] = useState<TableLayout | null>(null);
  const [openDropdown, setOpenDropdown] = useState<{ type: 'col' | 'row'; index: number } | null>(null);
  const panelHoveredRef = useRef(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const computeLayout = useCallback((table: HTMLTableElement): TableLayout | null => {
    if (!containerRef.current) return null;
    const tr = table.getBoundingClientRect();

    const columns: ColumnInfo[] = [];
    const firstRow = table.rows[0];
    if (firstRow) {
      Array.from(firstRow.cells).forEach((cell, index) => {
        const r = cell.getBoundingClientRect();
        columns.push({ index, left: r.left, width: r.width, cell: cell as HTMLTableCellElement });
      });
    }

    const rows: RowInfo[] = Array.from(table.rows).map((row, index) => {
      const r = row.getBoundingClientRect();
      return { index, top: r.top, height: r.height, row: row as HTMLTableRowElement };
    });

    return { table, top: tr.top, left: tr.left, width: tr.width, height: tr.height, columns, rows };
  }, [containerRef]);

  const clearHide = useCallback(() => {
    if (hideTimeoutRef.current) { clearTimeout(hideTimeoutRef.current); hideTimeoutRef.current = null; }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHide();
    hideTimeoutRef.current = setTimeout(() => {
      if (!panelHoveredRef.current) { setLayout(null); setOpenDropdown(null); }
    }, 200);
  }, [clearHide]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        let el = e.target as Element | null;
        let found: HTMLTableElement | null = null;
        while (el && el !== container) {
          if (el.tagName === 'TABLE' && el.closest('.tiptap')) { found = el as HTMLTableElement; break; }
          el = el.parentElement;
        }
        if (found) { clearHide(); setLayout(computeLayout(found)); }
        else scheduleHide();
      });
    };

    const handleScroll = () => {
      setLayout(prev => (prev?.table.isConnected ? computeLayout(prev.table) : null));
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearHide();
    };
  }, [containerRef, computeLayout, clearHide, scheduleHide]);

  useEffect(() => {
    if (!openDropdown) return;
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [openDropdown]);

  const focusCell = useCallback((cell: HTMLElement) => {
    if (!editor) return;
    try {
      const pos = editor.view.posAtDOM(cell, 0);
      editor.commands.setTextSelection(pos);
    } catch { /* no-op */ }
  }, [editor]);

  const handleAddColumnRight = useCallback(() => {
    if (!editor || !layout) return;
    const r = layout.table.rows[0];
    if (r?.cells.length) focusCell(r.cells[r.cells.length - 1]);
    insertColumnRight(editor);
  }, [editor, layout, focusCell]);

  const handleAddRowBelow = useCallback(() => {
    if (!editor || !layout) return;
    const r = layout.table.rows[layout.table.rows.length - 1];
    if (r?.cells.length) focusCell(r.cells[0]);
    insertRowBelow(editor);
  }, [editor, layout, focusCell]);

  const handleDeleteTable = useCallback(() => {
    if (!editor) return;
    deleteTable(editor);
    setLayout(null);
    setOpenDropdown(null);
  }, [editor]);

  const handleColAction = useCallback((action: string, colIndex: number) => {
    if (!editor || !layout) return;
    const col = layout.columns[colIndex];
    if (col) focusCell(col.cell);
    setOpenDropdown(null);
    switch (action) {
      case 'add_left': insertColumnLeft(editor); break;
      case 'add_right': insertColumnRight(editor); break;
      case 'delete': deleteColumn(editor); break;
      case 'align_left': editor.chain().focus().setCellAttribute('textAlign', 'left').run(); break;
      case 'align_center': editor.chain().focus().setCellAttribute('textAlign', 'center').run(); break;
      case 'align_right': editor.chain().focus().setCellAttribute('textAlign', 'right').run(); break;
    }
  }, [editor, layout, focusCell]);

  const handleRowAction = useCallback((action: string, rowIndex: number) => {
    if (!editor || !layout) return;
    const row = layout.rows[rowIndex];
    if (row?.row.cells.length) focusCell(row.row.cells[0]);
    setOpenDropdown(null);
    switch (action) {
      case 'add_above': insertRowAbove(editor); break;
      case 'add_below': insertRowBelow(editor); break;
      case 'delete': deleteRow(editor); break;
    }
  }, [editor, layout, focusCell]);

  if (!layout) return null;

  const ph = {
    onMouseEnter: () => { panelHoveredRef.current = true; clearHide(); },
    onMouseLeave: () => { panelHoveredRef.current = false; scheduleHide(); },
  };

  return (
    <>
      {/* Column grip handles — top of each column */}
      {layout.columns.map((col) => {
        const isOpen = openDropdown?.type === 'col' && openDropdown.index === col.index;
        return (
          <div
            key={`col-${col.index}`}
            {...ph}
            style={{ position: 'fixed', top: layout.top + 2, left: col.left + col.width / 2 - GRIP / 2, width: GRIP, height: GRIP, zIndex: 50 }}
          >
            <button
              type="button"
              onClick={() => setOpenDropdown(isOpen ? null : { type: 'col', index: col.index })}
              className="w-full h-full flex items-center justify-center rounded-sm bg-background/90 border border-border/70 text-muted-foreground hover:bg-accent hover:text-accent-foreground shadow-sm"
              aria-label={`Column ${col.index + 1} options`}
            >
              <ThreeDots horizontal />
            </button>
            {isOpen && (
              <div
                ref={dropdownRef}
                className="absolute top-full mt-1 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
                style={{ minWidth: 160, left: '50%', transform: 'translateX(-50%)', zIndex: 51 }}
              >
                <DropdownItem label={t('table.add_column_left')} onClick={() => handleColAction('add_left', col.index)} />
                <DropdownItem label={t('table.add_column_right')} onClick={() => handleColAction('add_right', col.index)} />
                <DropdownItem label={t('table.delete_column')} onClick={() => handleColAction('delete', col.index)} danger />
                <div className="my-1 h-px bg-border" />
                <div className="flex gap-0.5 px-1 py-0.5">
                  <IconBtn onClick={() => handleColAction('align_left', col.index)} label="Align left"><AlignLeft className="h-3.5 w-3.5" /></IconBtn>
                  <IconBtn onClick={() => handleColAction('align_center', col.index)} label="Align center"><AlignCenter className="h-3.5 w-3.5" /></IconBtn>
                  <IconBtn onClick={() => handleColAction('align_right', col.index)} label="Align right"><AlignRight className="h-3.5 w-3.5" /></IconBtn>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Row grip handles — left of each row */}
      {layout.rows.map((row) => {
        const isOpen = openDropdown?.type === 'row' && openDropdown.index === row.index;
        return (
          <div
            key={`row-${row.index}`}
            {...ph}
            style={{ position: 'fixed', top: row.top + row.height / 2 - GRIP / 2, left: layout.left + 2, width: GRIP, height: GRIP, zIndex: 50 }}
          >
            <button
              type="button"
              onClick={() => setOpenDropdown(isOpen ? null : { type: 'row', index: row.index })}
              className="w-full h-full flex items-center justify-center rounded-sm bg-background/90 border border-border/70 text-muted-foreground hover:bg-accent hover:text-accent-foreground shadow-sm"
              aria-label={`Row ${row.index + 1} options`}
            >
              <ThreeDots horizontal={false} />
            </button>
            {isOpen && (
              <div
                ref={dropdownRef}
                className="absolute top-1/2 left-full ml-1 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
                style={{ minWidth: 160, transform: 'translateY(-50%)', zIndex: 51 }}
              >
                <DropdownItem label={t('table.add_row_above')} onClick={() => handleRowAction('add_above', row.index)} />
                <DropdownItem label={t('table.add_row_below')} onClick={() => handleRowAction('add_below', row.index)} />
                <DropdownItem label={t('table.delete_row')} onClick={() => handleRowAction('delete', row.index)} danger />
              </div>
            )}
          </div>
        );
      })}

      {/* Add column — right edge */}
      <div {...ph} style={{ position: 'fixed', top: layout.top + layout.height / 2 - 12, left: layout.left + layout.width + 6, zIndex: 50 }}>
        <button
          type="button"
          onClick={handleAddColumnRight}
          className="h-6 w-6 flex items-center justify-center rounded-md bg-background/95 border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground shadow-sm"
          title={t('table.add_column_right')}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Add row — bottom edge */}
      <div {...ph} style={{ position: 'fixed', top: layout.top + layout.height + 6, left: layout.left + layout.width / 2 - 12, zIndex: 50 }}>
        <button
          type="button"
          onClick={handleAddRowBelow}
          className="h-6 w-6 flex items-center justify-center rounded-md bg-background/95 border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground shadow-sm"
          title={t('table.add_row_below')}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Delete table — top-right inside table */}
      <div {...ph} style={{ position: 'fixed', top: layout.top + 4, left: layout.left + layout.width - 28, zIndex: 50 }}>
        <button
          type="button"
          onClick={handleDeleteTable}
          className="h-6 w-6 flex items-center justify-center rounded-md bg-background/95 border border-border text-muted-foreground hover:bg-destructive/15 hover:text-destructive shadow-sm"
          title={t('table.delete_table')}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </>
  );
}

function ThreeDots({ horizontal }: { horizontal: boolean }) {
  return horizontal ? (
    <svg width="10" height="4" viewBox="0 0 10 4" fill="currentColor">
      <circle cx="1.5" cy="2" r="1.2" /><circle cx="5" cy="2" r="1.2" /><circle cx="8.5" cy="2" r="1.2" />
    </svg>
  ) : (
    <svg width="4" height="10" viewBox="0 0 4 10" fill="currentColor">
      <circle cx="2" cy="1.5" r="1.2" /><circle cx="2" cy="5" r="1.2" /><circle cx="2" cy="8.5" r="1.2" />
    </svg>
  );
}

function DropdownItem({ label, onClick, danger = false }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
        danger ? 'text-destructive hover:bg-destructive/15 hover:text-destructive' : ''
      }`}
    >
      {label}
    </button>
  );
}

function IconBtn({ onClick, label, children }: { onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {children}
    </button>
  );
}
