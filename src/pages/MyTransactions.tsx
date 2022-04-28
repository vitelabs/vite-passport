import TabContainer from '../components/TabContainer';
import TransactionList from '../containers/TransactionList';
import { testTransactions } from '../utils/constants';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

type Props = State;

const MyTransactions = ({ i18n }: Props) => {
	return (
		<TabContainer heading={i18n.myTransactions}>
			<div className="flex-1 overflow-scroll p-2 space-y-2">
				<TransactionList transactions={testTransactions} />
			</div>
		</TabContainer>
	);
};

export default connect(MyTransactions);
