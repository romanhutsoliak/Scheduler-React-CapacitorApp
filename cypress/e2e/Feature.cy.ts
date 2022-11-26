import console from 'console';
// https://dev.to/javierbrea/how-to-preserve-localstorage-between-cypress-tests-19o1
import 'cypress-localstorage-commands';

// Alias query if operationName matches
const setResAlias = (req, operationName) => {
    if (
        req.body.hasOwnProperty('operationName') &&
        req.body.operationName === operationName
    ) {
        req.alias = operationName;
    }
};

describe('The full test', () => {
    const login = 'testing@cypress.cy';
    const password = '123456';

    let createdTaskId: null | string = null;

    beforeEach(() => {
        cy.viewport(360, 660);
        cy.restoreLocalStorage();
        cy.intercept('POST', '/graphql', (req) => {
            req.alias = 'graphql';
            setResAlias(req, 'CompleteTask');
            setResAlias(req, 'GetTaskWithHistory');
            setResAlias(req, 'CreateTask');
            setResAlias(req, 'UpdateTask');
            setResAlias(req, 'DeleteTask');
        });
    });
    afterEach(() => {
        cy.saveLocalStorage();
    });

    it('Connect to the app', () => {
        cy.removeLocalStorage('scheduler_token');
        cy.visit('http://localhost:3003/tasks/26');
    });

    it('Login existing user', () => {
        cy.get('[name="email"]').clear().type(login);
        cy.get('[name="password"]').clear().type(password);
        cy.get('button[type="submit"]').click();

        cy.wait('@graphql').its('response.statusCode').should('eq', 200);
    });
});
