git config hook.runHook true
git config hook.pre-commit.event pre-commit
git config hook.pre-commit.command "npm run lint"
git config hook.pre-merge.event pre-merge-commit
git config hook.pre-merge.command "npm test #"
git config hook.pre-push.event pre-push
git config hook.pre-push.command "npm test #"
