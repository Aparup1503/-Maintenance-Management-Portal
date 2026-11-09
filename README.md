# Maintenance Management Portal

An Angular portal for managing residents, maintenance expenses, bills, and payments.

Administrators can maintain the resident directory, including flat assignments,
contact details, monthly maintenance amounts, and active status.

## Project overview

- **Frontend:** Angular 20
- **Mock API:** JSON Server
- **Repository:** [Aparup1503/-Maintenance-Management-Portal](https://github.com/Aparup1503/-Maintenance-Management-Portal)
- **Default branch:** `main`

## Run the application locally

### Prerequisites

- Node.js and npm
- Git

### Install dependencies

From the project directory, install the packages:

```powershell
npm install
```

### Start the mock API

In a terminal, start JSON Server:

```powershell
npm run api
```

The API uses `db.json` and is available at `http://localhost:3000`.

### Start Angular

In a second terminal, start the development server:

```powershell
npm start
```

Open `http://localhost:4200` in your browser.

## Available commands

| Command | Description |
| --- | --- |
| `npm start` | Start the Angular development server |
| `npm run api` | Start JSON Server using `db.json` on port 3000 |
| `npm run build` | Build the Angular application |
| `npm test` | Run the Angular unit tests |

## GitHub setup and first push

These are the steps used to publish the current project. Run Git commands from the project directory:

```powershell
cd 'D:\Angular App\Maintenance-Management-Portal\maintenance-management-portal'
```

### 1. Create the GitHub repository

Create a repository on GitHub with these settings:

- **Name:** `-Maintenance-Management-Portal`
- **Description:** `An Angular portal for managing maintenance expenses, bills, and payments.`
- **Visibility:** Choose Public or Private to suit your needs.
- **README, .gitignore, and license:** GitHub was initialized with a README for this project. If starting again, leave these unchecked when the files already exist locally.

### 2. Stage and commit the project files

The Angular project already had a local Git repository. All tracked and new project changes were staged, checked, and committed:

```powershell
git add -A
git diff --cached --stat
git diff --cached --check
git commit -m "Save current project changes"
```

The project changes were recorded in commit `9ea6760` (`Save current project changes`).

### 3. Connect the local repository to GitHub

Set the GitHub repository as `origin` and use `main` as the branch:

```powershell
git branch -M main
git remote add origin https://github.com/Aparup1503/-Maintenance-Management-Portal.git
```

If `origin` is already configured, update it instead of adding it again:

```powershell
git remote set-url origin https://github.com/Aparup1503/-Maintenance-Management-Portal.git
```

### 4. Integrate the GitHub starter commit

The first push was rejected because GitHub already had an initial commit containing its README. The GitHub history was fetched and merged with the local project history; it was not overwritten with a force push:

```powershell
git fetch origin
git merge --allow-unrelated-histories origin/main
```

Both repositories had a `README.md`, so Git reported an add/add conflict. The conflict was resolved by keeping the project’s Angular CLI instructions and adding the GitHub repository’s project description. The merged README was then committed:

```powershell
git add README.md
git commit -m "Merge GitHub initial commit"
```

### 5. Push and verify

Push `main` and configure it to track the GitHub branch:

```powershell
git push -u origin main
git status --short --branch
```

The push completed successfully. The local `main` branch tracks `origin/main`, and the working tree was clean. The merge commit is `2a74510` (`Merge GitHub initial commit`).

## Building and tests

Build the application with:

```powershell
npm run build
```

Run the unit tests with:

```powershell
npm test
```

For more information about Angular, see the [Angular documentation](https://angular.dev/).
