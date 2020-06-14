import * as React from 'react';
import { Suite } from "sarg";
import {
    RouteDefinition
} from '../src/types';
import {CreatedRoute, createRoutes} from '../src/routes-creator';
import {expect} from 'chai';

const suite = new Suite();

export const route1: RouteDefinition = {
    name: 'app',
    getComponent: async () => ({default: () => null})
};

export const route2: RouteDefinition = {
    name: 'app',
    component: () => null
};

export const route3: RouteDefinition = {
    name: 'app',
    path: '/',
    component: () => null,
    childRoutes: [
        {
            name: 'index',
            component: () => null
        }
    ]
};

const App: React.ComponentType<{}> = ({children}) => <React.Fragment>
    {children}
</React.Fragment>;

const Root: React.ComponentType<{}> = ({children}) => <React.Fragment>
    application
    <div>
        {children}
    </div>
</React.Fragment>;

const Admin: React.ComponentType<{}> = ({children}) => <React.Fragment>
    Admin
    <div>
        {children}
    </div>
</React.Fragment>;

const DarkMode: React.ComponentType<{}> = ({children}) => <React.Fragment>
    dark mode
    {children}
</React.Fragment>;

const LightMode: React.ComponentType<{}> = ({children}) => <React.Fragment>
    light mode
    {children}
</React.Fragment>;

const ListUsers: React.ComponentType<{}> = () => <React.Fragment>
    list users
</React.Fragment>;

const Index: React.ComponentType<{}> = ({children}) => <React.Fragment>
    index
    {children}
</React.Fragment>;

export const route4: RouteDefinition = {
    childRoutes: [{
        routes: [
            {
                name: 'app',
                path: '/',
                component: App
            },
            {
                name: 'admin',
                path: '/admin',
                component: Admin
            }
        ],
        childRoutes: [
            {
                childRoutes: [{
                    routes: [
                        {
                            name: 'dark',
                            path: 'dark',
                            component: DarkMode
                        },
                        {
                            name: 'light',
                            path: 'light',
                            component: LightMode
                        }
                    ],
                    childRoutes: [
                        {
                            name: 'list',
                            component: ListUsers
                        }
                    ]
                }],
                name: 'users',
                path: 'users'
            },
            {
                name: 'index',
                component: Index
            }
        ]
    }],
    name: 'root',
    component: Root
};

suite.test('it should accept container routes', () => {
    const App: React.ComponentType<{}> = ({children}) => <React.Fragment>
        {children}
    </React.Fragment>;
    const Wrapper: React.ComponentType<{}> = ({children}) => <React.Fragment>
        {children}
    </React.Fragment>;
    const Index: React.ComponentType<{}> = () => <React.Fragment>
        Index
    </React.Fragment>;
    const About: React.ComponentType<{}> = () => <React.Fragment>
        About
    </React.Fragment>;
    const routes = createRoutes({
        name: 'app',
        path: '/',
        component: App,
        childRoutes: [{
            name: 'wrapper',
            component: Wrapper,
            childRoutes: [
                {
                    name: 'index',
                    component: Index
                },
                {
                    name: 'about',
                    component: About
                }
            ]
        }]
    });
    const expectedRoutes: CreatedRoute[] = [
        [
            {name: 'app', path: '/', component: App},
            {name: 'wrapper', path: undefined, component: Wrapper},
            {name: 'index', path: undefined, component: Index}
        ],
        [
            {name: 'app', path: '/', component: App},
            {name: 'wrapper', path: undefined, component: Wrapper},
            {name: 'about', path: undefined, component: About}
        ]
    ];
    expect(routes).to.be.deep.equal(expectedRoutes);
});

suite.test('test2', () => {
    console.log(createRoutes({
        name: 'root',
        path: '/',
        childRoutes: [
            {
                routes: [
                    {
                        name: 'app',
                        path: '{id}'
                    },
                    {
                        name: 'admin',
                        path: 'admin/{id}'
                    }
                ]
            }
        ]
    }))
})

suite.test('it should create routes', async () => {
    const expectedRoutes4: CreatedRoute[] = [
        [
            {name: 'root', path: undefined, component: Root},
            {name: 'app', component: App, path: '/'},
            {name: 'users', path: 'users', component: undefined},
            {name: 'dark', path: 'dark', component: DarkMode},
            {name: 'list', path: undefined, component: ListUsers}
        ],
        [
            {name: 'root', path: undefined, component: Root},
            {name: 'app', component: App, path: '/'},
            {name: 'users', path: 'users', component: undefined},
            {name: 'light', path: 'light', component: LightMode},
            {name: 'list', path: undefined, component: ListUsers}
        ],
        [
            {name: 'root', path: undefined, component: Root},
            {name: 'app', path: '/', component: App},
            {name: 'index', path: undefined, component: Index}
        ],
        [
            {name: 'root', path: undefined, component: Root},
            {name: 'admin', component: Admin, path: '/admin'},
            {name: 'users', path: 'users', component: undefined},
            {name: 'dark', path: 'dark', component: DarkMode},
            {name: 'list', path: undefined, component: ListUsers}
        ],
        [
            {name: 'root', path: undefined, component: Root},
            {name: 'admin', component: Admin, path: '/admin'},
            {name: 'users', path: 'users', component: undefined},
            {name: 'light', path: 'light', component: LightMode},
            {name: 'list', path: undefined, component: ListUsers}
        ],
        [
            {name: 'root', path: undefined, component: Root},
            {name: 'admin', path: '/admin', component: Admin},
            {name: 'index', path: undefined, component: Index}
        ]
    ];
    expect(createRoutes(route4)).to.be.deep.equal(expectedRoutes4);
});

export default suite;
