import React from "react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

interface DataTableProps {
  data: any[];
  width?: number | string;
  height?: number | string;
}

const DataTable: React.FC<DataTableProps> = ({ data, width = "100%", height = "500px" }) => {


  return (
    <div>
      hello
    </div>
  );
};

export default DataTable;
