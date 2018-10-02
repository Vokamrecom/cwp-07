const http = require('http');
const fs = require('fs');
const hndl = require('./helpers/handlers');
const hndl_p = require('./helpers/handlers_public');
const jsonParser = require('./helpers/jsonParser');
const Err = require('./helpers/errors').Errors;
const LOG = require('./helpers/logger').LOG;
const jsonPath = './content/articles.json';
const _url = require('url');

const hostname = '127.0.0.1';
const port = 3000;

const articles = getJSON(jsonPath);

const server = http.createServer((req, res) => {
  
  jsonParser.parseBodyJson(req, (err, payload, url) => {
    
    LOG({"method": req.method, "URL": `${hostname}:${port}${req.url}`, "body": payload});
    res.setHeader('Content-Type', 'application/json');
    
    if(err){
      sendStatus(res, err);
    }
    else{
      const handler = getHandler(_url.parse(url, true).pathname);

      handler(req, res, payload, articles, (err, result, articles) => {
        if (err) {
          sendStatus(res, err);
          return;
        }
  
        updateJson(articles);
        res.statusCode = 200;
        if(res.getHeader('Content-Type') === 'application/json'){
          if(req.method === "POST"){
            res.writeHead(301, {Location: '/'});
          }
          else{
            res.write(JSON.stringify(result));
          }
        }
        else{
          res.write(result);
        }
        
        res.end();
      });
    }  
  });
});

server.listen(port, hostname, () => {
  checkDirs();
  console.log(`Server running at http://${hostname}:${port}/`);
});

function getHandler(url) {
  if(fs.existsSync(__dirname + '/public' + url))
    return hndl_p.getFile;
  return hndl.handlers[url] || hndl.notFound;
}

function updateJson(content){
  fs.writeFile(jsonPath, JSON.stringify(content), (err) => {
    if(err){
      console.error(err);
    }
  })
}

function getJSON(path){
  try{
    const content = JSON.parse(fs.readFileSync(path, 'utf8'));
    return content;    
  }    
  catch(Error){
    return [];
  }
}

function sendStatus(res, err){
  if(!err) err = Err[400];
  res.statusCode = err.code;
  LOG(err);
  res.setHeader('Content-Type', 'application/json');
  res.end( JSON.stringify(err) );
}

function checkDirs(){
  if(!fs.existsSync(`${__dirname}\\content`)){
    fs.mkdirSync(`${__dirname}\\content`);
  }
}