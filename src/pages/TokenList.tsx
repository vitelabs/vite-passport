import { connect } from '../utils/global-context';
import { State } from '../utils/types';

type Props = State;

// eslint-disable-next-line
const TokenList = ({}: Props) => {
	return (
		<div className="">
			<p>TokenList</p>
		</div>
	);
};

export default connect(TokenList);
