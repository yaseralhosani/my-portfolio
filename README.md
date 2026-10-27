# Web & Microsoft solutions portfolio

A responsive, dark portfolio covering web applications, Microsoft 365 and Office, Power BI, Power Apps, Power Automate, WordPress, WooCommerce, and web design. Built for GitHub Pages with HTML, CSS, and JavaScript, with interactive charts, project filters, and illustrative case studies. No packages or build step required.

## Edit in Portfolio Studio

Open **[the admin area](https://yaseralhosani.github.io/my-portfolio/admin/)**, or choose **Admin** in the website footer.

- **Projects:** add, duplicate, reorder, or remove projects; edit descriptions, tools, filters, links, case studies, and sample labels. Upload JPG, PNG, or WebP thumbnails; the editor resizes them to a maximum of 1,600 pixels and saves WebP files.
- **Profile & contact:** edit your introduction, name, role, availability, about text, email, social links, and form endpoint.
- **Skills:** add, edit, reorder, or remove skills and choose icons.
- **Preview:** view a private local draft using the actual portfolio layout. Contact-form sending is disabled in this preview. No draft changes appear to other visitors.
- **Backups:** download a JSON backup including pending thumbnails, or import it on another device. Local drafts survive page reloads on the same browser and origin. Download a backup before clearing browser storage or switching devices.

### Connect and publish

1. In the admin header, choose **Connect GitHub**.
2. Create a **fine-grained personal access token** on GitHub. Select only **yaseralhosani/my-portfolio** and grant **Contents: read and write**. Give it an expiry date. The connection dialog links to GitHub's token setup.
3. Paste the token into the admin dialog. It is sent only to `api.github.com`, kept in memory, and cleared on disconnect or page close. It is never included in drafts, exports, portfolio content, or source files. Reconnect after reloading the editor.
4. Edit your draft, choose **Preview**, then **Review & publish → Publish update**. The editor creates one commit containing the content and new images. The existing GitHub Pages workflow builds the live site. Use **View deployment** to see when the update finishes.

The admin page itself is public; GitHub enforces write authorization. Visitors can try editing their own local drafts but cannot change the live site without repository write access. There are no public visitor accounts or server database. This setup uses the portfolio's existing GitHub Pages hosting.

If content changed in another browser or on GitHub, publishing stops before overwriting it. Download a backup, choose **Reload published content**, and reapply your changes. The publisher preserves the existing repository tree and never force pushes. Uploaded images are added under `assets/uploads/`; removing a project does not delete previously published files from the repository.

The content file is `portfolio.js`: a `window.PORTFOLIO =` assignment containing valid JSON (quoted keys, no inline comments inside the object). Keep that format when editing manually. The admin parses it as JSON and never evaluates downloaded JavaScript. `admin/model.mjs` handles validation; `admin/github.mjs` handles publishing. Run `node --test admin/cms.test.mjs` for the publication and conflict tests.

The deployment stamps the content script URL with its Git commit so updates are not hidden by an older browser cache. The public site does not load the admin editor or its GitHub client.

## Make it yours

Edit **`portfolio.js`** to update your name, role, introduction, skills, contact information, social links, projects, and case studies. Project cards and their case studies use the same data, so adding work stays simple.

The included projects and chart metrics are clearly marked **illustrative examples with synthetic data**. Replace them with your own work and verified results before presenting the site as your portfolio. Your public GitHub profile and email are connected. Add your LinkedIn URL when ready.

For each new project, copy an existing project object in `portfolio.js`, give it a unique ID, and update its title, category, tools, summary, links, and case-study details. Keep text short, and explain the question, approach, finding, and next step. Use full `https://` URLs for external projects.

- Set `isSample: false` for your real work, update `year`, and replace `dataNote` with the source and any limitations. Sample labels disappear automatically when no sample projects remain.
- Use `filters: ["bi", "sql"]`, `filters: ["python"]`, or a combination of `bi`, `python`, `sql`, `web`, `microsoft`, `power`, `wordpress`, and `design` to choose where a project appears.
- Set `repository` and `liveUrl` to your actual project links. Empty links are hidden.
- For a thumbnail, put an image in `assets/` and set `image: "./assets/my-project.webp"`. Leave `image` empty to use one of the built-in `visual` styles: `retail`, `retention`, or `mobility`.

The hero dashboard stays an explicitly labeled synthetic-data demonstration. Its chart values live in `chartData` in `app.js`. If you change your name, also update the initial title and description in `index.html` so previews that do not run JavaScript show the right details.

Change base colors, spacing, and typography in **`styles.css`**. The creative presentation layer is in **`experience.css`**. Page structure is in `index.html`; portfolio interactions are in `app.js` and contact-form handling is in `contact.js`.

## Generative artwork and motion

The hero uses an original flat, animated Canvas 2D dot field. **Flow**, **Grid**, and **Orbit** change its pattern; **Trace** connects the dots into flowing lines. Move the cursor through the artwork to displace nearby dots. There is no 3D model or WebGL dependency.

`motion.js` controls the artwork, card tilt, magnetic buttons, and scroll progress. **Motion on/off** pauses decorative animation and remembers your choice. Reduced-motion preferences are respected. Pattern changes still work when paused. Rendering stops offscreen and in hidden tabs; a static dotted artwork appears if Canvas is unavailable. The analytics demo remains under **Analytics playground**.

Edit `experience.css` for styling and `motion.js` for artwork settings. Portfolio content stays in `portfolio.js`.

## Contact form

The form sends to **`y4ser.alhosani@gmail.com`** through [FormSubmit](https://formsubmit.co/), using the `email` value in `portfolio.js`. No account, server, or client-side API key is needed. The form shows sending, submitted, and error states. A submitted message means the service accepted it; it does not guarantee inbox delivery.

**Activate delivery before sharing the form:** submit one test from the [live portfolio](https://yaseralhosani.github.io/my-portfolio/#contact), open the FormSubmit activation email in the recipient inbox, and click its confirmation link. Check spam if it does not arrive. Then send another test and confirm receipt. Only the inbox owner can complete activation. Changing the recipient requires activation again. See FormSubmit's [activation FAQ](https://formsubmit.co/help).

To use an existing provider, set `contactFormEndpoint` in `portfolio.js` to its complete public **HTTPS** submission URL, for example `https://formspree.io/f/YOUR_FORM_ID`. This overrides the default FormSubmit address. Formspree uses FormData and a JSON response; custom endpoints must accept the same request and return a successful JSON response. Use a submission endpoint, never an account API key or other secret. The form preserves entered text when delivery cannot be confirmed.

When changing the address or endpoint, also update the form's initial `action` in `index.html` for visitors without JavaScript. The form fields require a name, valid email, and a message of at least 10 characters.

## Preview locally

From this folder, run:

```sh
python3 -m http.server 4173
```

Open [localhost:4173](http://localhost:4173). Stop the server with `Ctrl+C`. Refresh the page after editing a file.

The contact form must be tested through HTTP/HTTPS. Opening `index.html` directly with a `file://` URL disables sending and provides a link to the live portfolio.

## Publish with GitHub Pages

1. Create a GitHub repository and add these files, including `.github/workflows/deploy.yml`, to its `main` branch. A public repository works with GitHub Free.
2. In that repository, open **Settings → Pages**. Under **Build and deployment → Source**, select **GitHub Actions**. The deployment workflow is already included; no additional template is needed.
3. Open **Actions → Deploy portfolio to GitHub Pages → Run workflow** to publish. Later pushes to `main` publish updates automatically.
4. When the run succeeds, open the site link shown in **Settings → Pages** or in the workflow's deployment summary.

If your default branch has another name, update `branches: [main]` in the workflow. Standard project sites use `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`; a repository named `YOUR-USERNAME.github.io` uses the root URL. Local assets use relative paths so both work. Keep new local links relative (for example, `./assets/image.webp`) instead of starting them with `/`.

The workflow copies the public HTML, styles, scripts (including `draft-preview.js`), `portfolio.js`, `assets/`, `.nojekyll`, and the admin application files into its deployment folder. Tests are excluded. Put new public files in `assets/`, or add them to that copy step. A failed deployment can be inspected in the repository's **Actions** tab.

Publishing steps follow GitHub's [publishing-source guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) and [custom Pages workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
