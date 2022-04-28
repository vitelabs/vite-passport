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
				<div className="w-full top-10 shadow bg-skin-middleground">
					<p className="text-xl flex-1 text-center p-2">{heading}</p>
				</div>
			)}
			<div className="top-0 flex-1 overflow-scroll">{children}</div>
			<div className="top-10 h-8 bg-skin-middleground flex">
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
							className={`flex-1 xy darker-brightness-button ${active ? 'text-skin-primary' : 'text-skin-secondary'}`}
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
