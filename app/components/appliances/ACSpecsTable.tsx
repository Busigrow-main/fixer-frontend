"use client";

interface ACSpecsTableProps {
  specs: Record<string, string>;
}

export function ACSpecsTable({ specs }: ACSpecsTableProps) {
  if (!specs || Object.keys(specs).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No specifications available
      </div>
    );
  }

  // Format spec names: convert camelCase to Title Case
  const formatSpecName = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <tbody>
          {Object.entries(specs).map(([key, value], index) => (
            <tr
              key={key}
              className={`border-b ${
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              } hover:bg-gray-100 transition-colors`}
            >
              <td className="px-6 py-4 font-semibold text-gray-700 text-sm w-1/3">
                {formatSpecName(key)}
              </td>
              <td className="px-6 py-4 text-gray-600 text-sm">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
