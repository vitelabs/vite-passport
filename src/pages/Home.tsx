import { BookOpenIcon, CogIcon, CreditCardIcon } from '@heroicons/react/outline';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

type Props = State;

// eslint-disable-next-line
const Home = ({ i18n, setState }: Props) => {
	const navigate = useNavigate();

	return (
		<div className="h-full flex flex-col">
			<div className="flex-1"></div>
			<div className="h-10 bg-skin-middleground flex">
				{[
					[CreditCardIcon, '/home'],
					[BookOpenIcon, '/history'],
					[CogIcon, '/settings'],
				].map(([Icon, to]) => (
					<button className="flex-1 xy" onClick={() => navigate(to as string)}>
						<Icon className="h-6 w-6" />
					</button>
				))}
			</div>
		</div>
	);
};

export default connect(Home);
