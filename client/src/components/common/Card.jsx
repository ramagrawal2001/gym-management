import clsx from 'clsx';

const Card = ({ children, className }) => {
    return (
        <div className={clsx('bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md', className)}>
            {children}
        </div>
    );
};

export default Card;
