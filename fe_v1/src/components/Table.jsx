import React from "react";

const Table = ({ headers, data }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="table min-w-130 w-full text-left border-collapse rounded-lg shadow overflow-clip">
        <thead>
          <tr className="bg-primary text-white">
            {headers.map((header, index) => (
              <th key={index} className="p-2 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b
             hover:bg-gray-50">
              {Array.isArray(row) ? (
                row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="p-2">
                    {cell}
                  </td>
                ))
              ) : (
                <td className="p-2">{row}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;