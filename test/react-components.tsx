import * as React from 'react';

export function Home({}: any) {
    return <div>
        Home
    </div>;
}

export function Book({ location: { params: { id } } }: any) {
    return <div>
        Book id is "{id}"
    </div>;
}

export function Post({ location: { params: { id } } }: any) {
    return <div>
        {`Post id is "${id}"`}
    </div>;
}

export function Admin({}: any){
    return (
        <div>
            Welcome to the admin panel!
        </div>
    );
}

export function AppWrapper({ children }: any){
    return (
        <div>
            {children}
        </div>
    );
}

export function SpecialWrapper({ children }: any) {
    return (
        <div>
            <h1>This is a special wrapper</h1>
            <div>
                {children}
            </div>
        </div>
    );
}

export function HomeWrapper({ children }: any) {
    return (
        <div>
            This is the home wrapper
            {children}
        </div>
    );
}

export function Login({}: any) {
    return (
        <div>
            Login
            <form action="login.php">
                <input type="text" placeholder="Password" />
            </form>
        </div>
    );
}
