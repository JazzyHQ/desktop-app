## Getting started

### One time setup

Install `git-conventional-commits` and enable git hooks for the repository:

```bash
npm install --global git-conventional-commits
git config core.hooksPath .git-hooks
```

## Starting Development

Start the app in the `dev` environment:

```bash
npm start
```

## Packaging for Production

To package apps for the local platform:

```bash
CSC_LINK="~/certs/DeveloperIDApplication.p12" CSC_KEY_PASSWORD="<PASSWORD>" npm run package
```

## Docs

WIP

## License

Distributed under the AGPLv3 License. Read more [here](LICENSE).

## Contributions

Unless otherwise explicitly stated, you agree to provide your code contributions under the [MIT](CONTRIBUTIONS_LICENSE) license.
