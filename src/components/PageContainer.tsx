import { ReactNode } from 'react';
import { ArrowNarrowLeftIcon } from '@heroicons/react/solid';
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
			<div className="xy w-full h-12">
				<p className="text-lg">{heading}</p>
				<button className="absolute left-3 w-8 xy" onClick={() => navigate(-1)}>
					<ArrowNarrowLeftIcon className="w-5 text-skin-back-arrow-icon" />
				</button>
			</div>
			<div className={`flex-1 p-4 pt-0 flex flex-col z-10 ${className}`}>{children}</div>
		</div>
	);
};

export default PageContainer;
