import { setContext } from '@apollo/client/link/context';

export const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    // return the headers to the context so httpLink can read them
    return { headers };
});