// import { useCallback, useEffect, useState } from 'react';
import { useState } from 'react';
import TabContainer from '../components/TabContainer';
import TransactionList from '../containers/TransactionList';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

type Props = State;

const MyTransactions = ({ i18n }: Props) => {
	return (
		<TabContainer heading={i18n.myTransactions}>
			<div className="flex-1 overflow-scroll p-2 space-y-2">
				<TransactionList />
			</div>
		</TabContainer>
	);
};

export default connect(MyTransactions);
