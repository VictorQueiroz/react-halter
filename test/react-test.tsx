import assert from 'assert';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Router } from 'halter';
import { createMemoryHistory, History } from 'history';
import * as React from 'react';
import { test } from 'sarg';
import { RouterContext } from '../src';
import Link from '../src/Link';
import RouterView from '../src/RouterView';
import {
    Admin,
    AppWrapper,
    Book,
    Home,
    Login,
    SpecialWrapper
} from './react-components';

Enzyme.configure({
    adapter: new Adapter()
});

async function wait(history: History, cb: () => Promise<void>) {
    const waitNextChange = new Promise((resolve) => {
        const unlisten = history.listen((location) => {
            resolve(location);
            unlisten();
        });
    });
    await cb();
    await waitNextChange;
}

test('it should render index when /', async () => {
    const history = createMemoryHistory();
    const router = new Router(history);
    const wrapper = shallow<RouterView>(<RouterView
        router={router}
        routes={[{
            component: Home,
            name: 'home',
            path: '/'
        }]}
    />);

    await wrapper.instance().initPromise;

    assert(wrapper.update().first().equals(
        <Home/>
    ));
});

test('it should render /books/100', async () => {
    const history = createMemoryHistory();
    const router = new Router(history);

    const wrapper = shallow<RouterView>(<RouterView
        router={router}
        routes={[{
            component: Book,
            name: 'books',
            path: '/books/{id:[0-9]+}',
        }]}
    />);

    await wrapper.instance().initPromise;
    await wait(history, () => router.pushState('books', new Map().set('id', '100')));
    await router.pending;

    assert(wrapper.update().first().equals(
        <Book/>
    ));
});

test('it should redirect using onBefore() and replace state option', async () => {
    const history = createMemoryHistory();
    const router = new Router(history);

    const wrapper = shallow<RouterView>(<RouterView
        router={router}
        routes={[{
            component: Book,
            name: 'books',
            onBefore: (match, replaceState) => {
                replaceState('newBooks', match.params);
            },
            path: '/books/{id:[0-9]+}'
        }, {
            component: Book,
            name: 'newBooks',
            path: '/b/{id:[0-9]+}',
        }]}
    />);

    await wrapper.instance().initPromise;
    await wait(history, () => router.pushState('books', new Map().set('id', '100')));
    await router.pending;
    await new Promise((resolve) => setTimeout(resolve, 0));

    assert(wrapper.update().first().equals(
        <Book/>
    ));
});

test('it should work with default-exported react component modules', async () => {
    const history = createMemoryHistory();
    const router = new Router(history);

    const routes = [{
        childRoutes: [{
            getComponent: () => import('./Book.test'),
            name: 'books',
            path: 'books/{id:[0-9]+}'
        }],
        component: AppWrapper,
        name: 'admin',
        path: '/admin',
    }];
    const wrapper = shallow<RouterView>(<RouterView
        router={router}
        routes={routes}
    />);

    await wrapper.instance().initPromise;
    await wait(history, () => router.pushState('admin.books', new Map().set('id', '100')));
    await router.pending;

    assert(wrapper.update().first().equals(
        <AppWrapper >
            <Book />
        </AppWrapper>
    ));
});

test('it should support nested routes /admin/books/100', async () => {
    const history = createMemoryHistory();
    const router = new Router(history);

    const routes = [{
        childRoutes: [{
            component: Book,
            name: 'books',
            path: 'books/{id:[0-9]+}'
        }],
        component: AppWrapper,
        name: 'admin',
        path: '/admin',
    }];
    const wrapper = shallow<RouterView>(<RouterView
        router={router}
        routes={routes}
    />);

    await wrapper.instance().initPromise;
    await wait(history, () => router.pushState('admin.books', new Map().set('id', '100')));
    await router.pending;

    assert(wrapper.update().first().equals(
        <AppWrapper >
            <Book />
        </AppWrapper>
    ));
});

test('it should support labeled routes approach', async () => {
    const history = createMemoryHistory();
    const router = new Router(history);
    const wrapper = shallow<RouterView>(<RouterView
        router={router}
        routes={[{
            childRoutes: [{
                component: Home,
                name: 'index'
            }, {
                component: Admin,
                name: 'admin',
                path: 'admin'
            }],
            component: AppWrapper,
            name: 'app',
            path: '/'
        }]}
    />);

    await wrapper.instance().initPromise;

    assert(wrapper.update().equals(<AppWrapper >
        <Home />
    </AppWrapper>));

    await wait(history, () => router.pushState('app.admin'));
    await router.pending;

    assert(wrapper.update().equals(<AppWrapper>
        <Admin  />
    </AppWrapper>));

    await wait(history, () => router.pushState('app.index'));
    await router.pending;

    assert(wrapper.update().equals(<AppWrapper >
        <Home />
    </AppWrapper>));
});

test('it should not accept components that expect properties', () => {
    function Test({title}: {
        title: string;
    }) {
        return <React.Fragment>{title}</React.Fragment>;
    }
    <RouterView
        router={new Router(createMemoryHistory())}
        routes={[
            {
                // @ts-expect-error
                component: Test
            }
        ]}
    />;

});

test('it should accept components with children property', () => {
    function Test1({children}: {
        children?: React.ReactNode;
    }) {
        return <React.Fragment>
            {children}
        </React.Fragment>;
    }
    function Test2({children}: {
        children?: React.ReactNode;
    }) {
        return <React.Fragment>
            {children}
        </React.Fragment>;
    }
    <RouterView
        router={new Router(createMemoryHistory())}
        routes={[
            {
                name: 'route1',
                component: Test1
            },
            {
                name: 'route2',
                component: Test2
            }
        ]}/>
});

test('it should render special parent for particular sets of routes', async () => {
    const history = createMemoryHistory();
    const router = new Router(history);
    const wrapper = shallow<RouterView>(<RouterView
        router={router}
        routes={[{
            childRoutes: [{
                childRoutes: [{
                    component: Home
                }],
                component: AppWrapper,
                name: 'index',
            }, {
                childRoutes: [{
                    component: Login,
                    name: 'login',
                    path: 'login',
                }],
                component: SpecialWrapper
            }],
            name: 'app',
            path: '/'
        }]}
    />);

    await wrapper.instance().initPromise;
    await router.pending;

    await wait(history, () => router.pushState('app.index'));
    await router.pending;

    assert(wrapper.update().first().equals(<AppWrapper>
        <Home/>
    </AppWrapper>));

    await wait(history, () => router.pushState('app.login'));
    await router.pending;

    assert(wrapper.update().first().equals(<SpecialWrapper>
        <Login />
    </SpecialWrapper>));
});

test('Link: it should render link component according to parameters', async () => {
    const history = createMemoryHistory();
    const router = new Router(history);

    const noop = () => undefined;

    router.addRoute({
        callback: noop,
        path: '/',
    })
    .addRoute({
        callback: noop,
        name: 'login',
        path: '/login'
    })
    .addRoute({
        callback: noop,
        name: 'user.detail',
        path: '/users/{id:[0-9]+}'
    });
    await router.init();

    const wrapper = shallow(
        <RouterContext.Provider value={router}>
            <Link to="login">Go to login page</Link>
            <Link to="user.detail" params={new Map().set('id', '100')}>User 1 detail</Link>
        </RouterContext.Provider>
    );

    assert.equal(wrapper.html(), (
        '<a href="/login">Go to login page</a>' +
        '<a href="/users/100">User 1 detail</a>'
    ));
});

// test('it should execute all nested routes `onBefore` functions in the right order', async () => {
//     const router = new Router(createMemoryHistory());

//     const indexCallback = sinon.spy();
//     const appWrapperCallback = sinon.spy();
//     const homeCallback = sinon.spy();

//     const wrapper = shallow(<RouterView
//         router={router}
//         routes={[{
//             path: '/',
//             onBefore: indexCallback,
//             childRoutes: [{
//                 component: AppWrapper,
//                 onBefore: appWrapperCallback,
//                 childRoutes: [{
//                     component: Home,
//                     onBefore: homeCallback
//                 }]
//             }]
//         }]}
//     />);

//     await wait();

//     const argument = {
//         path: '/',
//         query: {},
//         originalRoute: '/',
//         params: {}
//     };

//     assert(indexCallback.calledWith(argument));
//     assert(appWrapperCallback.calledWith(argument));
//     assert(homeCallback.calledWith(argument));
// });

// test('it should support deep nested routes', async () => {
//     const router = new Router(createMemoryHistory());
//     const wrapper = shallow(<RouterView
//         router={router}
//         routes={[{
//             path: '/',
//             childRoutes: [{
//                 component: AppWrapper,
//                 path: 'app',
//                 childRoutes: [{
//                     component: HomeWrapper,
//                     childRoutes: [{
//                         path: 'home',
//                         component: Home
//                     }]
//                 }]
//             }]
//         }]}
//     />);

//     await Promise.all([
//         wrapper.instance()._initPromise,
//         router.pushState(null, null, '/app/home')
//     ]);

//     const location = {
//         path: '/app/home',
//         originalRoute: '/app/home',
//         query: {},
//         params: {}
//     };

//     assert(wrapper.update().first().equals(
//         <AppWrapper >
//             <HomeWrapper >
//                 <Home  />
//             </HomeWrapper>
//         </AppWrapper>
//     ));
// });
