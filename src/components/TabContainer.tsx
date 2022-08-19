import {
	CreditCardIcon as OutlineCreditCardIcon,
	BookOpenIcon as OutlineBookOpenIcon,
	CogIcon as OutlineCogIcon,
} from '@heroicons/react/outline';
import {
	CreditCardIcon as SolidCreditCardIcon,
	BookOpenIcon as SolidBookOpenIcon,
	CogIcon as SolidCogIcon,
} from '@heroicons/react/solid';
import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type Props = {
	children: ReactNode;
	heading?: string;
};

const TabContainer = ({ heading, children }: Props) => {
	const navigate = useNavigate();
	const { pathname } = useLocation();

	return (
		<div className="h-full flex flex-col">
			{heading && (
				<div className="h-12 xy">
					<p className="text-lg">{heading}</p>
				</div>
			)}
			<div className="top-0 flex-1 flex flex-col">{children}</div>
			{/* <div className="top-0 flex-1 overflow-scroll bg-white">{null}</div> */}
			<div className="h-10 flex shadow-lg shadow-white">
				{[
					['/home', OutlineCreditCardIcon, SolidCreditCardIcon],
					['/my-transactions', OutlineBookOpenIcon, SolidBookOpenIcon],
					['/settings', OutlineCogIcon, SolidCogIcon],
				].map(([to, OutlineIcon, SolidIcon]) => {
					const active = pathname === to;
					const Icon = active ? SolidIcon : OutlineIcon;
					return (
						<button
							key={to as string}
							disabled={active}
							className={`flex-1 xy ${active ? 'text-skin-highlight' : 'text-skin-secondary'}`}
							onClick={() => navigate(to as string, { replace: true })}
						>
							<Icon className="h-6 w-6 text-inherit" />
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default TabContainer;
