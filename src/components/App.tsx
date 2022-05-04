import Router from './Router';
import { Provider } from '../utils/global-context';
import { State } from '../utils/types';
// import { now } from '../main';

type Props = { initialState: Partial<State> };

const App = ({ initialState }: Props) => {
	// alert(Date.now() - now);
	return (
		<Provider initialState={initialState}>
			<Router />
		</Provider>
	);
};

export default App;
