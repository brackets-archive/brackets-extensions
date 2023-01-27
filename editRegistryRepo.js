const fs = require("fs");
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
    auth: ''
});

async function x() {
    let registry = JSON.parse(fs.readFileSync("registry.json", "utf-8"));
    let popularity = JSON.parse(fs.readFileSync("popularity.json", "utf-8"));
    console.log("number of registry extensions = ", Object.keys(registry).length);
    let updateCount = 0, totalinValidRepos = 0, skipped = 0;
    for (let registryKey of Object.keys(registry)) {
        let registryEntry = registry[registryKey];
        let repoURL = registry[registryKey].metadata.homepage;
        let extensionPopularity = popularity[registryKey] || {};
        let publishingOwner = registry[registryKey].owner.split(":")[1];
        extensionPopularity.totalDownloads = registry[registryKey].totalDownloads || 0;
        if(registryEntry.gihubStars){
            skipped++;
            continue; // we already did this
        }
        if(repoURL && repoURL.startsWith("http://github.com")){
            repoURL = repoURL.replace("http://github.com", "https://github.com");
            console.log("changed: ", repoURL)
        }
        if(repoURL && repoURL.startsWith("https://github.com")){
            let repoURLSplit = repoURL.replace("https://github.com/","").split("/");
            let owner = repoURLSplit[0], repoName = repoURLSplit[1];
            if(publishingOwner.toLowerCase() !== owner.toLowerCase()){
                console.log("publishing author is different, owner repo", publishingOwner, owner);
            }
            try{
                console.log("fetching: ", repoURL);
                let repoDetails = await octokit.request(`GET /repos/${owner}/${repoName}`, {
                    owner: 'OWNER',
                    repo: 'REPO'
                  });
                extensionPopularity.gihubStars = repoDetails.data.stargazers_count;
                registryEntry.gihubStars = repoDetails.data.stargazers_count;
                registryEntry.ownerRepo = repoURL;
            } catch(e){
                console.log("error fetching repo: ", repoURL);
                totalinValidRepos++;
            }
        }
        popularity[registryKey] = extensionPopularity;
        updateCount++;
        if (updateCount === 2000) {
            // trial run
            break;
        }
    }
    console.log("total processed: ", updateCount);
    console.log("total skipped: ", skipped);
    console.log("total invalid repos: ", totalinValidRepos);

    fs.writeFileSync("registry.json", JSON.stringify(registry, null, 4), "utf-8");
    fs.writeFileSync("popularity.json", JSON.stringify(popularity, null, 4), "utf-8");
}

x();