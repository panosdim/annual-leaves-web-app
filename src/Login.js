import React, { Component } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import './common.css';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { apiBaseUrl } from './Constants';
import { AuthContext } from './AuthContext';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
        };
    }

    signIn = e => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('email', this.state.email);
        formData.append('password', this.state.password);

        fetch(apiBaseUrl + 'login', {
            method: 'POST',
            body: formData,
            headers: {
                Accept: 'application/json',
            },
        })
            .then(res => res.json())
            .then(
                /**
                 * @typedef {Object} result
                 * @property {string} access_token - JWT Token.
                 */
                result => {
                    localStorage.setItem('token', result.access_token);
                    this.context.login();
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                error => {
                    console.log(error);
                },
            );
    };

    render() {
        const footer = (
            <span>
                <Button label='Login' icon='pi pi-sign-in' style={{ marginRight: '.25em' }} onClick={this.signIn} />
            </span>
        );
        return (
            <div className='center'>
                <Card title='Annual Leaves App' subTitle='Login' footer={footer}>
                    <h3>Email</h3>
                    <InputText value={this.state.email} onChange={e => this.setState({ email: e.target.value })} />
                    <h3>Password</h3>
                    <Password
                        value={this.state.password}
                        onChange={e => this.setState({ password: e.target.value })}
                        feedback={false}
                    />
                </Card>
            </div>
        );
    }
}

Login.contextType = AuthContext;
export default Login;
