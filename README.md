# Interoperability Incident Room

A standalone React, TypeScript and Vite classroom assessment for Information Management in Radiologic Sciences at De La Salle Medical and Health Sciences Institute. It is a static GitHub Pages site. Google Apps Script provides login, persistence and instructor data.

## Run and verify

```bash
npm install
npm run validate
npm run build
npm run dev
```

`vite.config.ts` uses a relative base by default, so project Pages URLs work without editing. If preferred, change `base` there to `/repository-name/`.

## Backend setup

The original Kano backend cannot support this assessment as-is because its actions and single `Responses` JSON schema are Kano-specific. Use one of these approaches:

1. Recommended: create a new Google Sheet, open Extensions > Apps Script, paste `apps-script/Code.gs`, deploy as a Web app executed as you with access set to Anyone, and place its `/exec` URL in `src/config.ts`.
2. Shared deployment: preserve Kano's code, rename Kano `doGet` and `doPost` to `kanoDoGet` and `kanoDoPost`, then add this project's `Code.gs`. The dispatcher passes non-interoperability requests to Kano. Deploy a new version. This creates namespaced sheets and does not alter Kano's `Responses` tab.

The script creates these tabs automatically: `Interop_Students`, `Interop_Attempts`, `Interop_Results`, `Interop_Progress`. Add students manually to `Interop_Students` using exactly these columns:

Opening the deployed application calls the backend setup endpoint and creates all four tabs. You can also select and run `setupInteroperability` once from the Apps Script editor.

`studentId | displayName | username | pin | scenarioId | enabled`

Students normally create their own record by entering a student name and choosing a PIN on first use. The backend assigns the least-used scenario from A to E to keep the class balanced. Returning students use the same name and PIN. The instructor may still add or edit rows manually. The `username` column remains blank for compatibility with existing sheets.

Keep the instructor PIN in `src/config.ts` and `apps-script/Code.gs` synchronized. It is a classroom deterrent, not secure authentication.

## GitHub repository and Pages

```bash
git init
git add .
git commit -m "Interoperability Incident Room"
git branch -M main
git remote add origin https://github.com/YOUR-USER/YOUR-REPOSITORY.git
git push -u origin main
```

In the new GitHub repository, choose Settings > Pages > Build and deployment > Source: GitHub Actions. The included workflow validates content, builds `dist` and deploys it.

## Persistence behavior

The server rejects duplicate question attempt numbers under a script lock. An attempt changes local state only after the server confirms it, so a failed save does not consume an attempt. The server progress record is returned at login and is the source of truth; localStorage is a same-browser cache. Results are inserted once per student. Instructor reset deletes that student's attempts, result and progress after confirmation.
