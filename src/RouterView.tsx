import { boundMethod } from 'autobind-decorator';
import { Router } from 'halter';
import * as React from 'react';
import { PureComponent } from 'react';
import RoutesTree, {
    IReactHalterLocation,
    IRouteDefinition
} from './RoutesTree';

export interface IRouterViewProps {
    router: Router;
    routes: IRouteDefinition[];
}

class RouterView<T extends object = {}> extends PureComponent<T & IRouterViewProps, {
    current?: {
        children: React.ReactNode;
        location: IReactHalterLocation;
    };
}> {
    public initPromise?: Promise<Router>;
    private tree = new RoutesTree(this.props.router, this.onReceiveChildren);
    constructor(props: T & IRouterViewProps) {
        super(props);
        this.state = {};
        this.tree.createRoutes(this.props.routes);
    }

    public componentDidMount() {
        this.initPromise = this.initializeRouter();
    }

    public componentWillUnmount() {
        this.props.router.destroy();
    }

    public componentDidUpdate({ routes: previousRoutes, router: previousRouter }: RouterView["props"]) {
        const {router, routes} = this.props;
        if(previousRouter !== router) {
            previousRouter.destroy();
            this.tree = new RoutesTree(router, this.onReceiveChildren);
        }
        if(previousRoutes !== routes) {
            router.destroy();
            this.tree.createRoutes(routes);
            this.initPromise = this.initializeRouter();
        }
    }

    public render() {
        const {
            current
        } = this.state;

        if(current) {
            return current.children;
        }

        return null;
    }

    @boundMethod
    public onReceiveChildren(children: React.ReactNode, location: IReactHalterLocation) {
        this.setState({
            current: {
                children,
                location
            }
        });
    }

    private initializeRouter(): Promise<Router> {
        return new Promise<Router>((resolve) => {
            resolve(this.props.router.init());
        }).catch(this.onInitFail);
    }

    @boundMethod
    private onInitFail(reason: any) {
        console.error('Failed to initialize router. See reason below:');
        console.error(reason);
        return this.props.router;
    }
}

export default RouterView;
