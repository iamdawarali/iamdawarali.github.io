# Dawar Ali — Portfolio

Modern, mobile-first, dark-mode portfolio. Content comes from `data/profile.json`.

## Customize content

- Edit `data/profile.json` with your real details:
  - name, role, bio, about, contact links
  - skills groups and items
  - experience (role, company, period, highlights)
  - projects (name, description, tech, links)
  - certifications
  - resumeUrl (optional)

Open `index.html` locally to preview. If your browser blocks `fetch` for local files, a built-in fallback is used so it still renders.

## Run locally

```bash
python3 -m http.server 8080
# visit http://localhost:8080/
```

## Deploy to GitHub Pages

1. Create a public repo named `YOUR_GITHUB_USERNAME.github.io`.
2. Push this folder's contents to the repo root (so `index.html` is at the root).
3. For user/organization sites, Pages will serve automatically from `main`.

Quick commands (replace placeholders):

```bash
git init
git add .
git commit -m "Init portfolio"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_GITHUB_USERNAME.github.io.git
git push -u origin main
```

Optional:
- Add `CNAME` file with your domain to use a custom domain.
- Replace social image referenced in `<head>` `og:image`.

## License

MIT
# portfolio
