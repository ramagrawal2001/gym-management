import { twMerge } from "tailwind-merge";

const Card = ({ children, className }) => {
    return (
        <div className={twMerge("bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors", className)}>
            {children}
        </div>
    );
};

export default Card;
