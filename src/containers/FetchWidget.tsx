import { useEffect, useState, useCallback, ReactNode } from 'react';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

type Props = State & {
	children: ReactNode;
	shouldFetch: boolean;
	getPromise: () => Promise<any>;
	onResolve?: (result: any) => void;
	onCatch?: (err: string) => void;
};

const FetchWidget = ({
	i18n,
	children,
	shouldFetch,
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
			.then((result) => onResolve && onResolve(result))
			.catch((err) => {
				console.log('err:', typeof err, err.constructor, err);
				const errorString =
					err.toString() === '[object Object]'
						? JSON.stringify(err)
						: err.toString();
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

	return error ? (
		<div className="xy flex-col min-h-8">
			<p className="text-skin-secondary text-center">{i18n.error}</p>
			<p className="text-skin-secondary text-center text-sm mt-0.5">
				"{error}"
			</p>
			<button className="mt-2 text-skin-highlight" onClick={fetchData}>
				{i18n.retry}
			</button>
		</div>
	) : children && !shouldFetch && !fetching ? (
		<>{children}</>
	) : fetching ? (
		<div className="xy min-h-8">
			<p className="text-skin-secondary text-center">{i18n.loading}...</p>
		</div>
	) : null;
};

export default connect(FetchWidget);
