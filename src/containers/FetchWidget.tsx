import { useEffect, useState, useCallback, ReactNode } from 'react';
import Spinner from '../components/Spinner';
import { connect } from '../utils/global-context';
import { makeReadable } from '../utils/strings';
import { State } from '../utils/types';

type Props = State & {
	children: ReactNode;
	shouldFetch: boolean;
	noSpinnerMargin?: boolean;
	getPromise: () => Promise<any>;
	onResolve?: (result: any) => void;
	onCatch?: (err: string) => void;
};

const FetchWidget = ({
	i18n,
	children,
	shouldFetch,
	noSpinnerMargin,
	getPromise,
	onResolve,
	onCatch,
}: Props) => {
	const [error, errorSet] = useState('');
	const [fetching, fetchingSet] = useState(false);

	const fetchData = useCallback(async () => {
		errorSet('');
		fetchingSet(true);
		getPromise()
			.then((result) => {
				return onResolve && onResolve(result);
			})
			.catch((err) => {
				console.log('err:', typeof err, err.constructor, err);
				const errorString = makeReadable(err);
				if (onCatch) {
					onCatch(errorString);
				}
				errorSet(errorString);
			})
			.finally(() => fetchingSet(false));
	}, [getPromise, onResolve, onCatch]);

	useEffect(() => {
		if (shouldFetch) {
			fetchData();
		}
	}, [shouldFetch, fetchData]);

	return fetching ? (
		<div className="xy min-h-8">
			<Spinner className={noSpinnerMargin ? '' : 'mt-2'} />
		</div>
	) : error ? (
		<div className="xy flex-col min-h-8">
			<p className="text-skin-secondary text-center">{i18n.error}</p>
			<p className="text-skin-secondary text-center text-sm mt-0.5">"{error}"</p>
			<button className="mt-2 text-skin-highlight" onClick={fetchData}>
				{i18n.retry}
			</button>
		</div>
	) : (
		<>{children}</>
	);
};

export default connect(FetchWidget);
