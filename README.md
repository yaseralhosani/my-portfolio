# Data analytics portfolio

A responsive, dark portfolio for GitHub Pages. Built with HTML, CSS, and JavaScript, with interactive charts, project filters, and case studies. No packages or build step required.

## Make it yours

Edit **`portfolio.js`** to update your name, role, introduction, skills, contact information, social links, projects, and case studies. Project cards and their case studies use the same data, so adding work stays simple.

The included projects and chart metrics are clearly marked **illustrative examples with synthetic data**. Replace them with your own work and verified results before presenting the site as your portfolio. Your public GitHub profile is connected. Add your email and LinkedIn URL when ready; the main contact button uses email first, then LinkedIn, then GitHub.

For each new project, copy an existing project object in `portfolio.js`, give it a unique ID, and update its title, category, tools, summary, links, and case-study details. Keep text short, and explain the question, approach, finding, and next step. Use full `https://` URLs for external projects.

- Set `isSample: false` for your real work, update `year`, and replace `dataNote` with the source and any limitations. Sample labels disappear automatically when no sample projects remain.
- Use `filters: ["bi", "sql"]`, `filters: ["python"]`, or a combination of `bi`, `python`, and `sql` to choose where a project appears.
- Set `repository` and `liveUrl` to your actual project links. Empty links are hidden.
- For a thumbnail, put an image in `assets/` and set `image: "./assets/my-project.webp"`. Leave `image` empty to use one of the built-in `visual` styles: `retail`, `retention`, or `mobility`.

The hero dashboard stays an explicitly labeled synthetic-data demonstration. Its chart values live in `chartData` in `app.js`. If you change your name, also update the initial title and description in `index.html` so previews that do not run JavaScript show the right details.

Change colors, spacing, and typography in **`styles.css`**. The main palette lives in the variables at the top. Page structure is in `index.html`; interactions are in `app.js`.

## Preview locally

From this folder, run:

```sh
python3 -m http.server 4173
```

Open [localhost:4173](http://localhost:4173). Stop the server with `Ctrl+C`. Refresh the page after editing a file.

## Publish with GitHub Pages

1. Create a GitHub repository and add these files, including `.github/workflows/deploy.yml`, to its `main` branch. A public repository works with GitHub Free.
2. In that repository, open **Settings → Pages**. Under **Build and deployment → Source**, select **GitHub Actions**. The deployment workflow is already included; no additional template is needed.
3. Open **Actions → Deploy portfolio to GitHub Pages → Run workflow** to publish. Later pushes to `main` publish updates automatically.
4. When the run succeeds, open the site link shown in **Settings → Pages** or in the workflow's deployment summary.

If your default branch has another name, update `branches: [main]` in the workflow. Standard project sites use `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`; a repository named `YOUR-USERNAME.github.io` uses the root URL. Local assets use relative paths so both work. Keep new local links relative (for example, `./assets/image.webp`) instead of starting them with `/`.

The workflow copies only `index.html`, `styles.css`, `app.js`, `portfolio.js`, `assets/`, and `.nojekyll` into its deployment folder. Put new public files in `assets/`, or add them to that copy step. A failed deployment can be inspected in the repository's **Actions** tab.

Publishing steps follow GitHub's [publishing-source guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) and [custom Pages workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
