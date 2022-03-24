import { ReactNode } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/outline';
import A from './A';
import { useNavigate } from 'react-router-dom';

type Props = {
	title?: string;
	children: ReactNode;
	className?: string;
};

const PageContainer = ({ title, children, className }: Props) => {
	const navigate = useNavigate();
	return (
		<div className="h-full pt-10 flex flex-col">
			<div className="fx fixed w-full top-0 bg-skin-base justify-between h-10 px-1">
				<button className="p-1 brightness-button" onClick={() => navigate(-1)}>
					<ChevronLeftIcon className="w-7 text-skin-secondary" />
				</button>
				<p className="text-xl font-bold">{title}</p>
				<div className="w-9" />
			</div>
			<div className={`flex-1 p-3 pt-0 flex flex-col ${className}`}>{children}</div>
		</div>
	);
};

export default PageContainer;
