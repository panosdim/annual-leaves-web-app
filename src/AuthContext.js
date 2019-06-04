import React from 'react';

export const AuthContext = React.createContext({
    isSignedIn: false,
    /**
     * @typedef {Object} user
     * @property {number} id - ID of the user.
     * @property {string} name - Full name of the user.
     * @property {email} email - Email of the user.
     * @property {string} total_leaves - Total annual leaves of the user.
     */
    user: {},
    login: () => {},
    logout: () => {},
});
