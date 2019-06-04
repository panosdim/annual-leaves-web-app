import React, { Component } from 'react';
import './App.css';
import './common.css';
import Login from './Login';
import AnnualLeaves from './AnnualLeaves';
import { apiBaseUrl } from './Constants';
import { AuthContext } from './AuthContext';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { ProgressSpinner } from 'primereact/progressspinner';

class App extends Component {
    constructor(props) {
        super(props);

        this.login = () => {
            this.checkSession();
        };

        this.logout = () => {
            this.setState({ isSignedIn: false });
        };

        // State also contains the updater function so it will
        // be passed down into the context provider
        this.state = {
            isSignedIn: false,
            isLoading: true,
            login: this.login,
            logout: this.logout,
            user: null,
        };
    }

    checkSession = () => {
        fetch(apiBaseUrl + 'user', {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token'),
                Accept: 'application/json',
            },
        }).then(response => {
            this.setState({
                isLoading: false,
            });
            if (response.status === 200) {
                response.json().then(result => {
                    this.setState({
                        isSignedIn: true,
                        user: result,
                    });
                });
            } else {
                this.setState({
                    isSignedIn: false,
                });
            }
        });
    };

    componentDidMount() {
        this.checkSession();
    }

    render() {
        if (this.state.isLoading) {
            return (
                <div className='center'>
                    <ProgressSpinner />
                </div>
            );
        } else {
            if (this.state.isSignedIn) {
                return (
                    <AuthContext.Provider value={this.state}>
                        <AnnualLeaves />
                    </AuthContext.Provider>
                );
            }
            return (
                <AuthContext.Provider value={this.state}>
                    <Login />
                </AuthContext.Provider>
            );
        }
    }
}

export default App;
