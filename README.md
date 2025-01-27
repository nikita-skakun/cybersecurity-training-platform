# Cybersecurity Training Platform

This is a final group project for the INFO 4290 course. We focused on creating a phishing and cybersecurity training platform that would provide client companies with a comprehensive quizzes and educational videos, as well as phishing simulation against employees. With a rising number of cyber-attacks around the world, the goal of the project is to help increase cybersecurity awareness in the workplaces.

## Authentication Outline:

- The backend of the platform connects using LDAP protocol to the Active Directory of the client company
- The user submits their credentials on the login page, which is then sent to the backend using an API
- Authentication of users is done on the backend, with a JWT token provided to client device if successful
- The client is free to access pages they have permissions for, by submitting their JWT token with each request
- All requests to the backend are validated with the JWT token, if it fails, the client device is sent to the login page
