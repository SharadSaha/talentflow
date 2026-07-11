import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

interface Candidate {
  id: string;
  name: string;
  role: string;
}

const columns: DataTableColumn<Candidate>[] = [
  { key: 'name', header: 'Name', cell: (row) => row.name },
  { key: 'role', header: 'Role', cell: (row) => row.role },
];

const rows: Candidate[] = [
  { id: '1', name: 'Ada Lovelace', role: 'Engineer' },
  { id: '2', name: 'Alan Turing', role: 'Researcher' },
];

describe('DataTable', () => {
  it('renders a row per data item with its cells', () => {
    render(<DataTable columns={columns} data={rows} getRowId={(row) => row.id} />);

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Researcher')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
  });

  it('shows the empty state when there is no data', () => {
    render(<DataTable columns={columns} data={[]} getRowId={(row) => row.id} />);
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('does not show the empty state while loading', () => {
    render(<DataTable columns={columns} data={[]} getRowId={(row) => row.id} isLoading />);
    expect(screen.queryByText('No results')).not.toBeInTheDocument();
  });

  it('invokes onRowClick when an interactive row is activated', async () => {
    const user = userEvent.setup();
    const handleRowClick = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        onRowClick={handleRowClick}
      />,
    );

    await user.click(screen.getByText('Ada Lovelace'));
    expect(handleRowClick).toHaveBeenCalledWith(rows[0]);
  });
});
