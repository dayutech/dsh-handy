# awesome-dsh-plugin submission

The marketplace (dshmarket) reads [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin); submit there, not to dshmarket.

## Before opening the PR

1. Push this repository so `assets/icon-180.png` and `screenshots.json` resolve from `main`.
2. Add the GitHub topic `dsh-plugin` to `dayutech/dsh-handy`.
3. Set the repository description to the same accurate feature summary used by the entry.
4. Run:

   ```powershell
   npm run build
   npm run check
   npm run pack:dry
   ```

5. Optional: publish `dsh-handy@0.8.0` to npm. The package is currently not published, so the README uses the GitHub install URL.

## Submission file

Copy `market/dayutech__dsh-handy.yml` to:

```text
data/plugins/dayutech__dsh-handy.yml
```

in a fork of `awesome-dsh-plugin/awesome-dsh-plugin`. Do not edit its generated READMEs.

- category: `ui`
- one entry only
- description must match the code
- icon and screenshots must be GitHub-hosted raster images

## Metadata to fill on GitHub

Repository description:

> DeepSeek Harness plugin with per-session notes, a draggable key-information panel, fork inheritance of notes and key information, workspace-scoped session groups, highlighting, running-workspace prioritization, and bulk close actions for every right-sidebar tab.

Required topic:

```text
dsh-plugin
```
