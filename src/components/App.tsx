import Router from './Router';
import { Provider } from '../utils/global-context';
import { State } from '../utils/types';

type Props = { initialState: Partial<State> };

const App = ({ initialState }: Props) => {
	return (
		<Provider initialState={initialState}>
			<Router />
		</Provider>
	);
};

export default App;
