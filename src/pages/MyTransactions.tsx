// import { useCallback, useEffect, useState } from 'react';
import { useState } from 'react';
import TabContainer from '../components/TabContainer';
import TransactionList from '../containers/TransactionList';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

type Props = State;

const MyTransactions = ({ i18n }: Props) => {
	const [showUnreceived, showUnreceivedSet] = useState(false);
	return (
		<TabContainer heading={i18n.myTransactions}>
			<div className="flex-1 overflow-scroll p-2 space-y-2">
				<div className="flex bg-skin-middleground shadow rounded overflow-hidden">
					<button
						className={`flex-1 brightness-button px-2 py-0.5 text-sm ${
							!showUnreceived ? 'bg-skin-foreground' : 'bg-skin-middleground'
						}`}
						onClick={() => showUnreceivedSet(false)}
					>
						{i18n.received}
					</button>
					<button
						className={`flex-1 brightness-button px-2 py-0.5 text-sm ${
							showUnreceived ? 'bg-skin-foreground' : 'bg-skin-middleground'
						}`}
						onClick={() => showUnreceivedSet(true)}
					>
						{i18n.unreceived}
					</button>
				</div>
				<TransactionList unreceived={showUnreceived} />
			</div>
		</TabContainer>
	);
};

export default connect(MyTransactions);
