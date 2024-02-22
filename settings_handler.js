const fs = require('fs');

function getSettingsJson(){    
    let supposeNoFile = false;
    try{
        let fileString = fs.readFileSync('./discord_settings.json', 'utf8');
        return JSON.parse(fileString);
    }catch{
        supposeNoFile = true;
    }
    if (supposeNoFile == true){
        try{
            let obj = {}
            let objStr = JSON.stringify(obj);
            fs.writeFileSync('./discord_settings.json', objStr, 'utf8');
            let fileString = fs.readFileSync('./discord_settings.json', 'utf8');
            return JSON.parse(fileString);
        }catch{
            return undefined;
        }
    }
}

function setSettingsJson(newContent){
    try{
        let content = JSON.stringify(newContent);
        fs.writeFileSync('./discord_settings.json', content, 'utf8');
        return undefined;
    }catch(e){
        return e;
    }
}

exports.getSettingsJson = getSettingsJson;
exports.setSettingsJson = setSettingsJson;