import { clsx } from "clsx";

export const Table = ({ children, className }) => (
    <div className={clsx("overflow-x-auto", className)}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">{children}</table>
    </div>
);

export const TableHeader = ({ children }) => (
    <thead className="bg-gray-50 dark:bg-slate-800/50">{children}</thead>
);

export const TableBody = ({ children }) => (
    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">{children}</tbody>
);

export const TableRow = ({ children, className }) => (
    <tr className={clsx("hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors", className)}>{children}</tr>
);

export const TableHead = ({ children, className }) => (
    <th className={clsx("px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", className)}>
        {children}
    </th>
);

export const TableCell = ({ children, className }) => (
    <td className={clsx("px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200", className)}>
        {children}
    </td>
);
