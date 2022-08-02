import Router from './Router';
import { Provider } from '../utils/global-context';
import { State } from '../utils/types';

type Props = { initialState: Partial<State> };

const App = ({ initialState }: Props) => {
	return (
		<Provider initialState={initialState}>
			<Router />
			{/* <p className="">test</p> */}
		</Provider>
	);
};

export default App;

// test wallet
// vite_9ec6e8ff9dfa0c0ca29be649bf1430bd0ea7504fa96f142a07
// weird soul hour mango catalog deposit sorry wild hazard verb vehicle solar bacon debris nut excuse key slogan screen excess leaf tape snake quit
