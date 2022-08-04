import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { connect } from '../utils/global-context';
import { getValue, setValue } from '../utils/storage';
import { State } from '../utils/types';

const Connect = ({ i18n, postPortMessage }: State) => {
	const [searchParams] = useSearchParams();
	const hostname = useMemo(() => searchParams.get('hostname'), [searchParams]);
	if (!hostname) {
		throw new Error('hostname not provided in search params');
	}

	return (
		<div className="p-4 h-full flex flex-col">
			<div className="flex-1 xy flex-col">
				<p className="text-2xl break-words max-w-full text-center">{hostname}</p>
				<p className="mt-2 text-xl text-center">
					{i18n.doYouWantToConnectVitePassportToThisDomain}
				</p>
			</div>
			<button
				className="mt-2 h-10 w-full bg-skin-highlight xy rounded-sm"
				onClick={async () => {
					const { connectedDomains = {} } = await getValue('connectedDomains');
					if (!connectedDomains?.[hostname]) {
						connectedDomains[hostname] = {};
					}
					await setValue({ connectedDomains });
					postPortMessage({ type: 'connectDomain', domain: hostname });
					window.close();
				}}
			>
				{i18n.connect}
			</button>
			<button
				className="mt-2 h-10 w-full bg-white xy rounded-sm text-skin-lowlight"
				onClick={() => window.close()}
			>
				{i18n.no}
			</button>
		</div>
	);
};

export default connect(Connect);
