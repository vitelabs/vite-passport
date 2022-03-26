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
			<div className="fx fixed w-full px-1 top-0 bg-skin-base">
				<button className="darker-brightness-button" onClick={() => navigate(-1)}>
					<ChevronLeftIcon className="w-8 text-skin-secondary" />
				</button>
				<p className="text-xl flex-1 text-center p-2 mr-8">{title}</p>
			</div>
			<div className={`flex-1 p-3 pt-0 flex flex-col z-10 ${className}`}>{children}</div>
		</div>
	);
};

export default PageContainer;
