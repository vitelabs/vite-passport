import { ReactNode } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/outline';
import { useNavigate } from 'react-router-dom';

type Props = {
	heading?: string;
	children: ReactNode;
	className?: string;
};

const PageContainer = ({ heading, children, className }: Props) => {
	const navigate = useNavigate();
	return (
		<div className="h-full flex flex-col ">
			<div className="fx w-full p-1 top-0 bg-skin-base">
				<button className="w-8 darker-brightness-button" onClick={() => navigate(-1)}>
					<ChevronLeftIcon className="text-skin-secondary" />
				</button>
				<p className="text-xl flex-1 text-center mr-8">{heading}</p>
			</div>
			<div className={`flex-1 p-3 pt-0 flex flex-col z-10 ${className}`}>{children}</div>
		</div>
	);
};

export default PageContainer;
