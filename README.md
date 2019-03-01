# react-halter

ReactJS bindings for easy integration with Halter router.

### Installation

```
yarn add react-halter
```

### Usage

The `RouterView` component lifecycle will determine what routes should be inside the given `Router` instance using the input `routes`. When `RouterView` is mounted it'll initialize the router instance and when it gets unmounted it'll clear all the routes and so forth

```js
import { createBrowserHistory } from 'history';
import { RouterView } from 'react-halter';
import { Router } from 'halter';
import Login from './components/login/login';
import NavigationBar from './components/navigation-bar/navigation-bar';
import BackendAPI from './services/backend-api';

function Post({ location: { params } }) {
    const postId = params.get('id');
    if(!postId) {
        return null;
    }
    return (
        <div>
            <h3>{posts[postId].title}</h3>
            <p>{posts[postId].contents}</p>
        </div>
    );
}

function HomeWrapper({ children }){
    return (
        <div>
            <NavigationBar/>
            <div>
                {children}
            </div>
        </div>
    )
}

const rules = {
    isAuthenticated: async function(match, replaceState, pushState) {
        if(await BackendAPI.isAuthenticated()){
            replaceState('dashboard');
            return true;
        }
    },
    isGuest: async function(match, replaceState, pushState) {
        if(await BackendAPI.isAuthenticated()){
            return true;
        }
        replaceState('app.login');
    }
}

const routes = [{
    path: '/',
    name: 'app',
    component: HomeWrapper,
    childRoutes: [{
        name: 'post',
        path: 'posts/{id:[A-z0-9]+}',
        component: Post
    }, {
        path: 'login',
        name: 'login',
        component: Login,
        onBefore: rules.isAuthenticated
    }]
}, {
    name: 'dashboard',
    path: '/dashboard',
    component: Dashboard,
    onBefore: rules.isGuest
}];

ReactDOM.render(<div>
    <h1>My first app</h1>
    <RouterView
        router={new Router(createBrowserHistory())}
        routes={routes} />
</div>, document.getElementById('app'));
```
