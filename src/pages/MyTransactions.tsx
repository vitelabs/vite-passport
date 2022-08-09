import TabContainer from '../components/TabContainer';
import TransactionList from '../containers/TransactionList';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

const MyTransactions = ({ i18n }: State) => {
	return (
		<TabContainer heading={i18n.myTransactions}>
			<TransactionList />
		</TabContainer>
	);
};

export default connect(MyTransactions);
