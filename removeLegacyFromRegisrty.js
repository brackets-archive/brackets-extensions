const fs = require("fs");

// only extensions marked as partial are removed

let legacyExts = JSON.parse(fs.readFileSync("LegacyNodeExtensions.json","utf-8"));
let registry = JSON.parse(fs.readFileSync("registry.json","utf-8"));
console.log("number of legacy node extensions = ", Object.keys(legacyExts).length);
console.log("number of registry extensions = ", Object.keys(registry).length);

for(let legacyName of Object.keys(legacyExts)){
    if(legacyExts[legacyName] === "full" && registry[legacyName]){
        delete registry[legacyName];
    }
}

console.log("number of registry extensions after delete = ", Object.keys(registry).length);

fs.writeFileSync("registry.json", JSON.stringify(registry), "utf-8");