# Cybersecurity Training Platform

This is a final group project for the INFO 4290 course. We focused on creating a phishing and cybersecurity training platform that would provide client companies with a comprehensive quizzes and educational videos, as well as phishing simulation against employees. With a rising number of cyber-attacks around the world, the goal of the project is to help increase cybersecurity awareness in the workplaces.

## Authentication Outline

- The backend of the platform connects using LDAP protocol to the Active Directory of the client company
- The user submits their credentials on the login page, which is then sent to the backend using an API
- Authentication of users is done on the backend, with a JWT token provided to client device if successful
- The client is free to access pages they have permissions for, by submitting their JWT token with each request
- All requests to the backend are validated with the JWT token, if it fails, the client device is sent to the login page

## To Get Started

0. Install Deno for your Operating System: [Installation Link](https://docs.deno.com/runtime/getting_started/installation/)
1. Clone the git repository using the command: `git clone git@github.com:nikita-skakun/cybersecurity-training-platform.git`
2. Go to the newly downloaded directory: `cd cybersecurity-training-platform`
3. Install Deno dependencies: `deno install`
4. Start the development Deno server: `deno run dev --allow-test-user`
5. Go to the hosted website: <http://localhost:3000>
6. Login with `test@example.com` email and `test` password
7. To reset the database for testing, delete the `database.db` file in root directory

## To Use LDAP for Account Management

1. Modify the `config.json.sample` with Active Directory information and rename to `config.json`
2. Start the production Deno server: `deno run serve`
3. Go to the hosted website: <http://localhost:3000>
