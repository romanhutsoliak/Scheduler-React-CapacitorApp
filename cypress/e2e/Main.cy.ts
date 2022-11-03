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
        cy.restoreLocalStorage();
        cy.intercept('POST', '/graphql', (req) => {
            req.alias = 'graphql';
            setResAlias(req, 'CompleteTask');
            setResAlias(req, 'GetTaskWithHistory');
            setResAlias(req, 'CreateTask');
            setResAlias(req, 'UpdateTask');
        });
    });
    afterEach(() => {
        cy.saveLocalStorage();
    });

    it('Connect to the app', () => {
        cy.removeLocalStorage('scheduler_token');
        cy.visit('http://localhost:3003');
    });

    it('Login attempt', () => {
        cy.get('#mainPageCreateANewTask').click();
        cy.url().should('include', '/login');
    });

    it('Go to registration', () => {
        cy.contains('new account').click();
        cy.url().should('include', '/register');
    });

    //it('Register an new user', () => {
    //    cy.get('[name="email"]').type(login);
    //    cy.get('[name="password"]').type(password);
    //    cy.get('[name="password_confirmation"]').type(password);
    //    cy.get('button[type="submit"]').click();
    //});

    it('Register with an existing user', () => {
        cy.get('[name="email"]').type(login);
        cy.get('[name="password"]').type(password);
        cy.get('[name="password_confirmation"]').type(password);
        cy.get('button[type="submit"]').click();

        cy.wait('@graphql').its('response.statusCode').should('eq', 200);

        cy.get('[name="email"] + .invalid-feedback').should('be.visible');
    });

    it('Login with wrong credentials', () => {
        cy.get('.registerLoginLink').click();

        // wrong password
        cy.get('[name="email"]').type(login);
        cy.get('[name="password"]').type(password + '_???');
        cy.get('button[type="submit"]').click();

        cy.wait('@graphql').its('response.statusCode').should('eq', 200);
        cy.get('[name="password"] + .invalid-feedback').should('be.visible');

        // wrong email format (validation)
        cy.get('[name="email"]')
            .clear()
            .type(login + '_???');
        cy.get('[name="password"]').clear().type(password);
        cy.get('button[type="submit"]').click();
        cy.get('[name="email"] + .invalid-feedback').should('be.visible');

        // wrong email
        cy.get('[name="email"]')
            .clear()
            .type('123_' + login);
        cy.get('[name="password"]').clear().type(password);
        cy.get('button[type="submit"]').click();

        cy.wait('@graphql').its('response.statusCode').should('eq', 200);
        cy.get('[name="password"] + .invalid-feedback').should('be.visible');
    });

    it('Login existing user', () => {
        cy.get('[name="email"]').clear().type(login);
        cy.get('[name="password"]').clear().type(password);
        cy.get('button[type="submit"]').click();

        cy.wait('@graphql').its('response.statusCode').should('eq', 200);
    });

    const taskName = 'The first test task';
    const taskTime = '1700';
    it('Create a new task', () => {
        cy.get('#mainPageCreateANewTask').click();

        // with empty fields
        cy.get('button[type="submit"]:visible').click();
        cy.get('[name="name"] + .invalid-feedback').should('be.visible');
        cy.get('[name="periodTypeTime"] + .invalid-feedback').should(
            'be.visible'
        );

        // periodTypeTime is empty
        cy.get('[name="name"]').type(taskName);
        cy.get('button[type="submit"]:visible').click();
        cy.get('[name="name"] + .invalid-feedback').should('be.hidden');
        cy.get('[name="periodTypeTime"] + .invalid-feedback').should(
            'be.visible'
        );

        // periodTypeTime wrong format
        cy.get('[name="periodTypeTime"]').clear().type('tttt');
        cy.get('button[type="submit"]:visible').click();
        cy.get('[name="name"] + .invalid-feedback').should('be.hidden');
        cy.get('[name="periodTypeTime"] + .invalid-feedback').should(
            'be.visible'
        );

        // required fields are filled
        cy.get('[name="periodTypeTime"]').clear().type(taskTime);
        cy.get('button[type="submit"]:visible').click();
        cy.get('[name="name"] + .invalid-feedback').should('be.hidden');
        cy.get('[name="periodTypeTime"] + .invalid-feedback').should(
            'be.hidden'
        );
        cy.wait('@CreateTask').then((interception) => {
            createdTaskId =
                interception.response?.body?.data?.createTask?.id ?? null;

            cy.url().should('include', '/tasks/' + createdTaskId);
            cy.log(
                JSON.stringify(
                    interception.response?.body?.data?.createTask?.id
                )
            );
        });
    });

    it('Check task details', () => {
        cy.get('.taskViewDetailDiv h3').should('have.text', taskName);

        cy.get('.taskViewHistory .taskViewHistoryDiv').should(
            'have.class',
            'taskViewHistoryNoEvents'
        );
    });

    const newTaskName = taskName + ' :updated name';
    it('Edit task', () => {
        cy.get('.taskViewDetailBtnEdit').click();

        cy.url().should('include', '/tasks/' + createdTaskId + '/edit');

        cy.get('[name="name"]').clear();
        cy.get('button[type="submit"]:visible').click();
        cy.get('[name="name"] + .invalid-feedback').should('be.visible');
        cy.get('[name="name"]').clear().type(newTaskName);

        cy.get('button[type="submit"]:visible').click();
        let updateTaskId: null | string = null;
        cy.wait('@UpdateTask').then((interception) => {
            updateTaskId =
                interception.response?.body?.data?.updateTask?.id ?? null;

            expect(updateTaskId).equal(createdTaskId);
        });
    });

    it('Check task details after update', () => {
        cy.get(
            '.breadCrumbsSpan a[href="/tasks/' + createdTaskId + '"]'
        ).click();
        cy.url().should('include', '/tasks/' + createdTaskId);

        cy.get('.taskViewDetailDiv h3').should('have.text', newTaskName);

        cy.get('.taskViewHistory .taskViewHistoryDiv').should(
            'have.class',
            'taskViewHistoryNoEvents'
        );
    });

    const completeNotesText = 'Complete notes';
    it('Complete task', () => {
        cy.get('.taskViewDetailBtnComplete').click();

        cy.get('#globalModal').should('be.visible');
        cy.get('#completeNotesTextarea').clear().type(completeNotesText);

        cy.get('#globalModal button[type="submit"]:visible').click();
        cy.wait('@CompleteTask').then((interception) => {
            const completeTaskId =
                interception.response?.body?.data?.completeTask?.id ?? null;

            expect(completeTaskId).equal(createdTaskId);

            // Check if event appeared
            cy.wait('@GetTaskWithHistory').then((interception) => {
                cy.get('.taskViewHistoryDivText').should(
                    'have.text',
                    completeNotesText
                );
            });
        });
    });
});
