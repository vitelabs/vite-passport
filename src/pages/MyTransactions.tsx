import TabContainer from '../components/TabContainer';
import TransactionList from '../containers/TransactionList';
import { testTransactions } from '../utils/constants';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

type Props = State;

const MyTransactions = ({}: Props) => {
	return (
		<TabContainer scrollable={false}>
			<div className="w-full top-0 bg-skin-middleground">
				<p className="text-xl flex-1 text-center p-2">My Transactions</p>
			</div>
			<div className="flex-1 overflow-scroll p-2 space-y-2">
				<TransactionList transactions={testTransactions} />
			</div>
		</TabContainer>
	);
};

export default connect(MyTransactions);
