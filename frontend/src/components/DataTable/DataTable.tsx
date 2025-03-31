import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {
  ModuleRegistry,
} from 'ag-grid-community';
import {
  AllCommunityModule,
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

interface DataTableProps {
  data: any[];
  width?: number | string;
  height?: number | string;
}

const DataTable: React.FC<DataTableProps> = ({ data, width = '100%', height = 500 }) => {
  // Dynamically create column definitions from the first data object
  const columnDefs = data && data.length > 0 ?
    Object.keys(data[0]).map(key => ({
      headerName: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      field: key,
      sortable: true,
      filter: typeof data[0][key] === 'number' ? 'agNumberColumnFilter' : true,
      flex: 1,
      resizable: true,
      cellClass: 'ag-cell-center', // Center align cell content
      headerClass: 'ag-header-custom', // Custom header class for styling
    })) : [];

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: true,  // Enables filter inputs in the header
  };

  const gridOptions = {
    rowData: data,
    columnDefs: columnDefs,
    defaultColDef: defaultColDef,
    animateRows: true,
    enableRangeSelection: true,
    suppressRowClickSelection: true,
    pagination: true,
    paginationPageSize: 10,
    domLayout: 'autoHeight', // Automatically adjust the height based on the rows
  };

  return (
    <div
      className="ag-theme-alpine"
      style={{
        width,
        height,
        paddingTop: 20,
      }}
    >
      <AgGridReact
        {...gridOptions}
        domLayout="autoHeight"
      />
    </div>
  );
};

export default DataTable;
