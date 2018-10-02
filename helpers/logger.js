const fs = require('fs');
const logPath = './content/LogFile.json';

function LOG(content){
    let logArray = getJSON();

    let log = { "date": getDate() };
    for(let elem in content){
        log[elem] = content[elem];
    }
    logArray.push(log);

    updateJson(logArray);
}

function getDate(){
    let date = new Date().toString();
    return date.split(/ /g).slice(1, 5).join(' ');
}  

function getJSON(){
    try{
      const content = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      return content;
    }
    catch(Error){
      return [];
    }
}

function updateJson(content){
    fs.writeFileSync(logPath, JSON.stringify(content), (err) => {
        if(err){
        console.error(err);
        }
    })
}

module.exports.LOG = LOG;
module.exports.getJSON = getJSON;