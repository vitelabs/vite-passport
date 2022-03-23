import TabContainer from '../components/TabContainer';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

type Props = State;

const History = ({}: Props) => {
	return (
		<TabContainer>
			<p>History</p>
		</TabContainer>
	);
};

export default connect(History);
