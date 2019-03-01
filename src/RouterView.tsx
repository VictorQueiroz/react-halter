import autobind from 'autobind-decorator';
import { Router } from 'halter';
import * as React from 'react';
import { PureComponent } from 'react';
import RoutesTree, { IRouteDefinition } from './RoutesTree';

export interface IRouterViewProps {
    router: Router;
    routes: IRouteDefinition[];
}

class RouterView<T extends object = {}> extends PureComponent<T & IRouterViewProps, {
    children?: React.ReactNode;
}> {
    public initPromise?: Promise<Router>;
    private tree = new RoutesTree(this.props.router, this.onReceiveChildren);
    constructor(props: T & IRouterViewProps) {
        super(props);
        this.state = {};
    }

    @autobind
    public onReceiveChildren(children: React.ReactNode) {
        this.setState({
            children
        });
    }

    public componentWillUnmount() {
        this.props.router.destroy();
    }

    public UNSAFE_componentWillReceiveProps(nextProps: RouterView["props"]) {
        let router: Router = this.props.router;
        if(nextProps.router !== router) {
            router.destroy();
            router = nextProps.router;
            this.tree = new RoutesTree(router, this.onReceiveChildren);
        }
        if(nextProps.routes !== this.props.routes) {
            router.destroy();
            this.tree.createRoutes(nextProps.routes);
            router.init();
        }
    }

    public componentDidMount() {
        this.initPromise = new Promise((resolve) => {
            this.tree.createRoutes(this.props.routes);
            resolve(this.props.router.init());
        });
    }

    public render() {
        const {
            children
        } = this.state;

        if(children) {
            return children;
        }

        return <span className="router-not-ready"/>;
    }
}

export default RouterView;
