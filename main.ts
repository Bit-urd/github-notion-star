import { github } from './libs/github';
import { notion } from './libs/notion';
import assert from 'assert';

async function fullSync() {
    await Promise.all([github.fullSync(), notion.fullSyncIfNeeded()]);
    for (const repo of github.repoList.reverse()) {
        if (!notion.hasPage(repo.nameWithOwner)) {
            await notion.insertPage(repo, 'Star');
        }
    }

    for (const repo of github.myRepoList.reverse()) {
        if (!notion.hasPage(repo.nameWithOwner)) {
            let repoType = 'My';
            if (repo.isFork) {
                repoType = 'Fork';
            }
            await notion.insertPage(repo, repoType);
        }
    }
}

async function partialSync() {
    await Promise.all([github.getList(), notion.fullSyncIfNeeded()]);

    for (const repo of github.repoList.reverse()) {
        if (notion.hasPage(repo.nameWithOwner)) {
            console.log(`Skip saved page ${repo.nameWithOwner}`);
            continue;
        }
        await notion.insertPage(repo, 'Star');
    }

    for (const repo of github.myRepoList.reverse()) {
        if (notion.hasPage(repo.nameWithOwner)) {
            console.log(`Skip saved page ${repo.nameWithOwner}`);
            continue;
        }
        let repoType = 'My';
        if (repo.isFork) {
            repoType = 'Fork';
        }
        await notion.insertPage(repo, repoType);
    }
}

// fullSync();
// partialSync();

const ENVS = ['NOTION_API_KEY', 'NOTION_DATABASE_ID', 'TOKEN_OF_GITHUB'];

ENVS.forEach((env) => {
    assert(process.env[env], `${env} must be added`);
});

if (process.env.FULL_SYNC) {
    fullSync();
} else {
    partialSync();
}
