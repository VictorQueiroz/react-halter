/* tslint:disable max-classes-per-file */

import * as React from 'react';

export interface IComponentProps {
    location: {
        params: Map<string, string>;
    };
}

export class Home extends React.PureComponent<IComponentProps> {
    public render() {
        return <div>
            Home
        </div>;
    }
}

export class Book extends React.PureComponent<IComponentProps> {
    public render() {
        const {location: {params}} = this.props;
        return <div>
            Book id is "{params.get('id')}"
        </div>;
    }
}

export class Post extends React.PureComponent<IComponentProps> {
    public render() {
        const {location: {params}} = this.props;
        return <div>
            {`Post id is "${params.get('id')}"`}
        </div>;
    }
}

export class Admin extends React.PureComponent<IComponentProps> {
    public render() {
        return (
            <div>
                Welcome to the admin panel!
            </div>
        );
    }
}

export class AppWrapper extends React.PureComponent<IComponentProps> {
    public render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}

export class SpecialWrapper extends React.PureComponent<IComponentProps> {
    public render() {
        return (
            <div>
                <h1>This is a special wrapper</h1>
                <div>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export class HomeWrapper extends React.PureComponent<IComponentProps> {
    public render() {
        return (
            <div>
                This is the home wrapper
                {this.props.children}
            </div>
        );
    }
}

export class Login extends React.PureComponent<IComponentProps> {
    public render() {
        return (
            <div>
                Login
                <form action="login.php">
                    <input type="text" placeholder="Password" />
                </form>
            </div>
        );
    }
}
