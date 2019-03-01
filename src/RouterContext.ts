import { Router } from 'halter';
import { createSafeContext } from 'react-context-utilities';

const RouterContext = createSafeContext<Router>({
    name: 'RouterContext'
});

export default RouterContext;
