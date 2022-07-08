import { accountBlock } from '@vite/vitejs';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

// eslint-disable-next-line
const SignTx = ({}: State) => {
	const [searchParams] = useSearchParams();
	const block = useMemo(() => {
		const methodName = searchParams.get('methodName');
		const params = searchParams.get('params');
		console.log('methodName:', methodName);
		console.log('params:', params);
		return accountBlock.createAccountBlock(methodName!, params);
	}, [searchParams]);
	return (
		<div className="">
			<p>SignTx</p>
		</div>
	);
};

export default connect(SignTx);
