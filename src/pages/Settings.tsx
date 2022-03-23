import TabContainer from '../components/TabContainer';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

type Props = State;

const Settings = ({}: Props) => {
	return (
		<TabContainer>
			<p>Settings</p>
		</TabContainer>
	);
};

export default connect(Settings);
