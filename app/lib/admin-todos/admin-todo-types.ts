export type AdminTodoDbColumn = "pending" | "in_progress";

export type AdminTodoBoardColumnId = "pending" | "inProgress";

export type AdminTodoTask = {
  id: string;
  title: string;
  description: string;
};

export type AdminTodoBoardState = Record<AdminTodoBoardColumnId, AdminTodoTask[]>;

export type AdminTodoBoardPayload = {
  pending: string[];
  inProgress: string[];
};

export type AdminTodoRow = {
  id: string;
  title: string;
  description: string;
  board_column: AdminTodoDbColumn;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export function boardColumnToDbColumn(
  column: AdminTodoBoardColumnId,
): AdminTodoDbColumn {
  return column === "inProgress" ? "in_progress" : "pending";
}

export function dbColumnToBoardColumn(
  column: AdminTodoDbColumn,
): AdminTodoBoardColumnId {
  return column === "in_progress" ? "inProgress" : "pending";
}

export function emptyAdminTodoBoard(): AdminTodoBoardState {
  return { pending: [], inProgress: [] };
}

export function groupAdminTodosByColumn(rows: AdminTodoRow[]): AdminTodoBoardState {
  const board = emptyAdminTodoBoard();

  for (const row of rows) {
    const column = dbColumnToBoardColumn(row.board_column);
    board[column].push({
      id: row.id,
      title: row.title,
      description: row.description,
    });
  }

  return board;
}
