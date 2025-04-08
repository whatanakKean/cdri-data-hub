import React from 'react';
import { Table, ScrollArea } from '@mantine/core';

interface DataTableProps {
  data: any[];
  width?: number | string;
  height?: number | string;
}

const DataTable: React.FC<DataTableProps> = ({ data, width = '100%', height = 500 }) => {
  // Columns to exclude
  const excludedColumns = ['id', 'series_code', 'subsector_1', 'subsector_2', 'tag'];

  // Dynamically create column headers from the first data object, excluding certain keys
  const headers = data && data.length > 0 
    ? Object.keys(data[0]).filter(key => !excludedColumns.includes(key)) 
    : [];

  // Format header names (e.g., "first_name" -> "First Name")
  const formattedHeaders = headers.map(key => 
    key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  );

  // Prepare rows data
  const rows = data.map((item, index) => (
    <Table.Tr key={index}>
      {headers.map((key) => (
        <Table.Td key={key} style={{ textAlign: 'center' }}>
          {item[key]}
        </Table.Td>
      ))}
    </Table.Tr>
  ));

  return (
    <ScrollArea
      style={{
        width,
        height,
      }}
    >
      <Table
        striped
        withColumnBorders
        highlightOnHover
        horizontalSpacing="md"
        verticalSpacing="sm"
        style={{ tableLayout: 'auto' }}
      >
        <Table.Thead>
          <Table.Tr>
            {formattedHeaders.map((header) => (
              <Table.Th key={header} style={{ textAlign: 'center' }}>
                {header}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
};

export default DataTable;
