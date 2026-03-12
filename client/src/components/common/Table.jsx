import { clsx } from "clsx";

export const Table = ({ children, className, ...props }) => (
    <div className={clsx("overflow-x-auto", className)} {...props}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">{children}</table>
    </div>
);

export const TableHeader = ({ children, className, ...props }) => (
    <thead className={clsx("bg-gray-50 dark:bg-slate-800/50", className)} {...props}>{children}</thead>
);

export const TableBody = ({ children, className, ...props }) => (
    <tbody className={clsx("bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700", className)} {...props}>{children}</tbody>
);

export const TableRow = ({ children, className, ...props }) => (
    <tr className={clsx("hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors", className)} {...props}>{children}</tr>
);

export const TableHead = ({ children, className, ...props }) => (
    <th className={clsx("px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", className)} {...props}>
        {children}
    </th>
);

export const TableCell = ({ children, className, ...props }) => (
    <td className={clsx("px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200", className)} {...props}>
        {children}
    </td>
);
