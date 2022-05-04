// import React from 'react';
import App from './components/App';
import './styles/reset.css';
import './styles/colors.css';
import './styles/classes.css';
import './styles/theme.ts';

import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
	// https://stackoverflow.com/a/65167384/13442719
	// <React.StrictMode>
	<App />
	// </React.StrictMode>
);
