const fs = require("fs");
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
    auth: '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'
})

async function x() {
    let registry = JSON.parse(fs.readFileSync("registry.json", "utf-8"));
    let ownerDetails = JSON.parse(fs.readFileSync("ownerDetails.json", "utf-8"));
    console.log("number of registry extensions = ", Object.keys(registry).length);
    let ownerCount = 0, updateCount = 0,orgCount = 0, verifiedOrgs = 0;
    for (let registryKey of Object.keys(registry)) {
        let owner = registry[registryKey].owner;
        if (!ownerDetails[owner]) {
            let ownerSplit = registry[registryKey].owner.split(":");
            try{
                console.log("fetching ", owner);
                let ownerInfo = await octokit.request(`GET /orgs/${ownerSplit[1]}`, {
                    org: 'ORG'
                })
                console.log(ownerInfo.data);
                ownerDetails[owner] = ownerInfo.data;
                orgCount ++;
                if(ownerInfo.data.is_verified){
                    verifiedOrgs++;
                }
            } catch(e){
                if(e.status !== 404){
                    console.error("Error fetching with critical error", e);
                    break;
                }
                ownerDetails[owner] = {}
            }
            updateCount++;
        }
        ownerCount++;
        if (updateCount === 500) {
            // trial run
            break;
        }
    }
    console.log("total processed: ", ownerCount);
    console.log("total updated: ", updateCount);
    console.log("total orgs updated: ", orgCount);
    console.log("verified orgs updated: ", verifiedOrgs);

    fs.writeFileSync("ownerDetails.json", JSON.stringify(ownerDetails, null, 4), "utf-8");
}

x();