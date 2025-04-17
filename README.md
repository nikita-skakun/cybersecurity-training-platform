# Cybersecurity Training Platform

This is a final group project for the INFO 4290 course. We focused on developing a phishing and cybersecurity training platform that provides client companies with comprehensive quizzes and educational videos, as well as phishing simulation to raise awareness. With a growing number of cyber-attacks around the world, the goal of the project is to help increase cybersecurity awareness in workplaces.

The application uses a modular architecture and includes content on topics such as phishing campaigns, password security, and social engineering. Each module presents scenarios based on real-world incidents and introduces both offensive and defensive concepts. The goal is to help users recognize vulnerabilities and understand the methods used to exploit them.

Training modules combine written explanations and short videos that present key ideas and outline common attack methods. At the end of each module, a quiz checks understanding and reinforces the material. These elements support consistent learning and give users a way to measure their progress.

The platform helps bridge the gap between theory and practice by offering clear, accessible content. The interface is simple, and the material suits learners with different levels of experience. While it does not rely heavily on interactive features, it offers a reliable way for employees and learners to complete cybersecurity training in a structured format.

## Outline of Components

### Core System Architecture

#### Frontend and Interface

- Built with React for a responsive, browser-based UI
- Uses Material UI for layout and styling
- Structured content delivery through a modular system

#### Backend and Infrastructure

- Backend served through Deno
- SQLite database stores user progress and quiz data
- Application and media hosted on a VPS, separate from phishing services

#### Authentication and Access Control

- Stateless login via JWT
- LDAP integration with a TypeScript client for centralized user management
- Role-based access control for enterprise deployment

### Learning and Simulation Features

#### Training Modules

- Topics include phishing, password security, and social engineering
- Each module contains written explanations and videos, followed by a quiz
- Structured JSON files manage content for easy updates

#### Phishing Simulation Engine

- Sends realistic phishing emails using NodeMailer and Handlebars templates
- Hosted on a dedicated AWS VM alongside LLDAP
- Tests recognition skills in controlled scenarios

#### Progress and Feedback

- Real-time feedback through quizzes
- Tracks individual completion and performance
- Results stored and available to both users and admins

### Administrative and Development Framework

#### Admin Dashboard

- Provides access to user activity, quiz results, and training status
- Helps IT staff or educators monitor group progress

#### Project Tools and Workflow

- Managed with Trello, versioned via GitHub, developed in VS Code
- Agile methodology with sprint-based development and regular feedback

#### Security, Compliance, and Extensibility

- Built with secure coding practices
- Modular architecture allows scaling, custom module creation, and localization

## To Get Started

0. Install Deno for your Operating System: [Installation Link](https://docs.deno.com/runtime/getting_started/installation/)
1. Clone the git repository using the command: `git clone git@github.com:nikita-skakun/cybersecurity-training-platform.git`
2. Go to the newly downloaded directory: `cd cybersecurity-training-platform`
3. Install Deno dependencies: `deno install`
4. Start the development Deno server: `deno run dev --allow-test-user`
5. Go to the hosted website: <http://localhost:3000>
6. Login with email `test@example.com` and password `test`
7. To reset the database for testing, delete the `database.db` file in root directory

## To Use LDAP for Account Management

1. Modify the `config.json.sample` with Active Directory information and rename to `config.json`
2. Start the production Deno server: `deno run serve`
3. Go to the hosted website: <http://localhost:3000>

## License

This project is licensed under the BSD 3-Clause License - see the [LICENSE](LICENSE) file for details.
