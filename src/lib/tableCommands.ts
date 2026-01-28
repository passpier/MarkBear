/**
 * Table Commands Utility
 * Provides helper functions for inserting and manipulating tables in the editor
 */

import { Editor } from '@tiptap/react';

export interface TableDimensions {
  rows: number;
  cols: number;
}

/**
 * Insert a table at the current cursor position
 * @param editor - The TipTap editor instance
 * @param dimensions - Table dimensions (rows and columns)
 */
export function insertTable(
  editor: Editor,
  dimensions: TableDimensions = { rows: 3, cols: 3 }
) {
  const { rows, cols } = dimensions;

  editor
    .chain()
    .focus()
    .insertTable({ rows, cols, withHeaderRow: true })
    .run();
}

/**
 * Insert a row above the current table row
 * @param editor - The TipTap editor instance
 */
export function insertRowAbove(editor: Editor) {
  editor.chain().focus().addRowBefore().run();
}

/**
 * Insert a row below the current table row
 * @param editor - The TipTap editor instance
 */
export function insertRowBelow(editor: Editor) {
  editor.chain().focus().addRowAfter().run();
}

/**
 * Delete the current table row
 * @param editor - The TipTap editor instance
 */
export function deleteRow(editor: Editor) {
  editor.chain().focus().deleteRow().run();
}

/**
 * Insert a column to the left of the current column
 * @param editor - The TipTap editor instance
 */
export function insertColumnLeft(editor: Editor) {
  editor.chain().focus().addColumnBefore().run();
}

/**
 * Insert a column to the right of the current column
 * @param editor - The TipTap editor instance
 */
export function insertColumnRight(editor: Editor) {
  editor.chain().focus().addColumnAfter().run();
}

/**
 * Delete the current table column
 * @param editor - The TipTap editor instance
 */
export function deleteColumn(editor: Editor) {
  editor.chain().focus().deleteColumn().run();
}

/**
 * Delete the entire table
 * @param editor - The TipTap editor instance
 */
export function deleteTable(editor: Editor) {
  editor.chain().focus().deleteTable().run();
}

/**
 * Toggle column alignment for the current column
 * Cycles through: left → center → right → left
 * @param editor - The TipTap editor instance
 * @param align - Current alignment to toggle from
 */
export function toggleColumnAlignment(
  editor: Editor,
  align: 'left' | 'center' | 'right' = 'left'
) {
  const nextAlign = align === 'left' ? 'center' : align === 'center' ? 'right' : 'left';

  editor
    .chain()
    .focus()
    .setCellAttribute('textAlign', nextAlign)
    .run();
}

/**
 * Merge table cells (currently just a placeholder for future implementation)
 * Note: Standard markdown doesn't support cell merging; this would require HTML fallback
 */
export function mergeCells() {
  // Placeholder - would require custom implementation
  console.warn('Cell merging not yet implemented');
}
