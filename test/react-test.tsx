import * as React from 'react';
import assert from 'assert';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { test } from 'sarg';
import { Router } from 'halter';
import RouterView from '../src/RouterView';
import {
    Admin,
    AppWrapper,
    Book,
    Home,
    SpecialWrapper,
    Login
} from './react-components';
import { createMemoryHistory, History } from 'history';

Enzyme.configure({
    adapter: new Adapter()
});

// const books = {
//     1: {
//         title: 'Book 1'
//     }
// };

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
            path: '/',
            name: 'home',
            component: Home
        }]}
    />);

    await wrapper.instance()._initPromise;

    assert(wrapper.update().first().equals(
        <Home location={{
            name: 'home',
            params: {},
            query: {}
        }}/>
    ));
});

test('it should render /books/100', async () => {
    const history = createMemoryHistory();
    const router = new Router(history);

    const wrapper = shallow<RouterView>(<RouterView
        router={router}
        routes={[{
            name: 'books',
            path: '/books/{id:[0-9]+}',
            component: Book
        }]}
    />);

    await wrapper.instance()._initPromise;
    await wait(history, () => router.pushState('books', {id: '100'}));
    await router.pending;

    assert(wrapper.update().first().equals(
        <Book
            location={{
                name: 'books',
                params: {
                    id: '100'
                },
                query: {}
            }}
        />
    ));
});

test('it should redirect using onBefore() and replace state option', async () => {
    const history = createMemoryHistory();
    const router = new Router(history);

    const wrapper = shallow<RouterView>(<RouterView
        router={router}
        routes={[{
            path: '/books/{id:[0-9]+}',
            name: 'books',
            component: Book,
            onBefore: (match, replaceState) => {
                replaceState('newBooks', {
                    id: match.params.id
                });
            }
        }, {
            name: 'newBooks',
            path: '/b/{id:[0-9]+}',
            component: Book
        }]}
    />);

    await wrapper.instance()._initPromise;
    await wait(history, () => router.pushState('books', {
        id: '100'
    }));
    await router.pending;

    assert(wrapper.update().first().equals(
        <Book
            location={{
                name: 'newBooks',
                query: {},
                params: {
                    id: '100'
                }
            }}
        />
    ));
});

test('it should support nested routes /admin/books/100', async () => {
    const history = createMemoryHistory();
    const router = new Router(history);

    const routes = [{
        path: '/admin',
        name: 'admin',
        component: AppWrapper,
        childRoutes: [{
            name: 'books',
            path: 'books/{id:[0-9]+}',
            component: Book
        }]
    }];
    const wrapper = shallow<RouterView>(<RouterView
        router={router}
        routes={routes}
    />);

    await wrapper.instance()._initPromise;
    await wait(history, () => router.pushState('admin.books', {
        id: '100'
    }));
    await router.pending;

    const location = {
        name: 'admin.books',
        params: {
            id: '100'
        },
        query: {}
    };

    assert(wrapper.update().first().equals(
        <AppWrapper location={location}>
            <Book location={location}/>
        </AppWrapper>
    ));
});

test('it should support labeled routes approach', async () => {
    const history = createMemoryHistory();
    const router = new Router(history);
    const wrapper = shallow<RouterView>(<RouterView
        router={router}
        routes={[{
            path: '/',
            name: 'app',
            component: AppWrapper,
            childRoutes: [{
                name: 'index',
                component: Home
            }, {
                name: 'admin',
                path: 'admin',
                component: Admin
            }]
        }]}
    />);

    await wrapper.instance()._initPromise;

    const paths = {
        index: {
            name: 'app.index',
            params: {},
            query: {}
        },
        admin: {
            name: 'app.admin',
            params: {},
            query: {}
        }
    };

    assert(wrapper.update().equals(<AppWrapper location={paths.index}>
        <Home location={paths.index}/>
    </AppWrapper>));

    await wait(history, () => router.pushState('app.admin'));
    await router.pending;

    assert(wrapper.update().equals(<AppWrapper location={paths.admin}>
        <Admin location={paths.admin} />
    </AppWrapper>));

    await wait(history, () => router.pushState('app.index'));
    await router.pending;

    assert(wrapper.update().equals(<AppWrapper location={paths.index}>
        <Home location={paths.index}/>
    </AppWrapper>));
});

test('it should render special parent for particular sets of routes', async () => {
    const history = createMemoryHistory();
    const router = new Router(history);
    const wrapper = shallow<RouterView>(<RouterView
        router={router}
        routes={[{
            path: '/',
            name: 'app',
            childRoutes: [{
                name: 'index',
                component: AppWrapper,
                childRoutes: [{
                    component: Home
                }]
            }, {
                component: SpecialWrapper,
                childRoutes: [{
                    name: 'login',
                    path: 'login',
                    component: Login
                }]
            }]
        }]}
    />);

    await wrapper.instance()._initPromise;
    await router.pending;

    await wait(history, () => router.pushState('app.index'));
    await router.pending;

    const location1 = {
        name: 'app.index',
        query: {},
        params: {}
    };

    assert(wrapper.update().first().equals(<AppWrapper location={location1}>
        <Home location={location1}/>
    </AppWrapper>));

    await wait(history, () => router.pushState('app.login'));
    await router.pending;

    const location2 = {
        name: 'app.login',
        query: {},
        params: {}
    };

    assert(wrapper.update().first().equals(<SpecialWrapper location={location2}>
        <Login location={location2} />
    </SpecialWrapper>));
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
//         <AppWrapper location={location}>
//             <HomeWrapper location={location}>
//                 <Home location={location} />
//             </HomeWrapper>
//         </AppWrapper>
//     ));
// });
