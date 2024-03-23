const fs = require('fs');
const cnst = require('./constants.js');

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

function checkCommandHasPermission(interaction, roleArr, fraction = ""){
    let result = false;
    const settings = getSettingsJson();
    for (let role of roleArr){
        if (settings[role]){
            if (role != cnst.ROLES.frac_head.VALUE){
                if (settings[role].dsUsers && Array.isArray(settings[role].dsUsers)){
                    if (settings[role].dsUsers.find(user => user == interaction.member.user.username)){
                        return true;
                    }
                }    
                if (settings[role].dsRoles && Array.isArray(settings[role].dsRoles)){
                    if (interaction.member.roles.cache.hasAny(settings[role].dsRoles) == true){
                        return true;
                    }
                }  
            }else{
                if (fraction == ""){
                    for (let frac in settings[role]){
                        if (settings.frac_head[frac].dsUsers && Array.isArray(settings[role][frac].dsUsers)){
                            if (settings[role][frac].dsUsers.find(user => user == interaction.member.user.username)){
                                return true;
                            }
                        } 
                        if (settings.frac_head[frac].dsRoles && Array.isArray(settings[role][frac].dsRoles)){
                            if (interaction.member.roles.cache.hasAny(settings[role][frac].dsRoles) == true){
                                return true;
                            }
                        }
                    }
                }else{
                    if (settings.frac_head[fraction].dsUsers && Array.isArray(settings.frac_head[fraction].dsUsers)){
                        if (settings.frac_head[fraction].dsUsers.find(user => user == interaction.member.user.username)){
                            return true;
                        }
                    } 
                    if (settings.frac_head[fraction].dsRoles && Array.isArray(settings.frac_head[fraction].dsRoles)){
                        if (interaction.member.roles.cache.hasAny(settings.frac_head[fraction].dsRoles) == true){
                            return true;
                        }
                    }

                }
            }
        }
    }
    return result;
}

exports.getSettingsJson = getSettingsJson;
exports.setSettingsJson = setSettingsJson;
exports.checkCommandHasPermission = checkCommandHasPermission;
