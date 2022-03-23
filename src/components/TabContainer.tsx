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
	scrollable?: boolean;
};

const TabContainer = ({ scrollable = true, children }: Props) => {
	const navigate = useNavigate();
	const { pathname } = useLocation();

	return (
		<div className="h-screen flex flex-col">
			{scrollable ? <div className="flex-1 overflow-scroll">{children}</div> : children}
			<div className="h-8 bg-skin-middleground flex">
				{[
					['/home', OutlineCreditCardIcon, SolidCreditCardIcon],
					['/history', OutlineBookOpenIcon, SolidBookOpenIcon],
					['/settings', OutlineCogIcon, SolidCogIcon],
				].map(([to, OutlineIcon, SolidIcon]) => {
					const active = pathname === to;
					const Icon = active ? SolidIcon : OutlineIcon;
					return (
						<button className="flex-1 xy" onClick={() => navigate(to as string)}>
							<Icon className={`h-6 w-6 ${active ? 'text-skin-primary' : 'text-skin-secondary'}`} />
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default TabContainer;
