import clsx from 'clsx';

export const Table = ({ children, className }) => {
    return (
        <div className={clsx('w-full overflow-hidden rounded-xl border border-gray-200', className)}>
            <table className="w-full text-left text-sm">{children}</table>
        </div>
    );
};

export const TableHeader = ({ children }) => {
    return <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">{children}</thead>;
}

export const TableBody = ({ children }) => {
    return <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>;
}

export const TableRow = ({ children, className }) => {
    return <tr className={clsx('hover:bg-gray-50/50 transition-colors', className)}>{children}</tr>;
}

export const TableHead = ({ children, className }) => {
    return <th className={clsx('px-6 py-4 font-medium', className)}>{children}</th>;
}

export const TableCell = ({ children, className }) => {
    return <td className={clsx('px-6 py-4 text-gray-700', className)}>{children}</td>;
}
