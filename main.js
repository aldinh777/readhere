const fs = require('fs')
const http = require('http')
const path = require('path')

const isDirectory = (location) => fs.lstatSync(location).isDirectory()
function readManga(pre, files){
  return `
<!DOCTYPE html>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<title>Happy Reading</title>
<style>
  body {
    background-color: #000;
    text-align: center;
  }
  img {
    max-width: 100%;
  }
  #back {
    position: fixed;
    top: 0%;
    left: 0%;
    background: white;
    width: 100%;
    opacity: 0;
  }
  #back:hover {
    opacity: 1;
  }
</style>
<a id="back" href="/${pre}">Back</a>
${files
  .filter(file => ['.png', '.jpg', '.jpeg'].includes(path.extname(file)))
  .map(file => `<div><img src="/${path.join(pre, file)}"/></div>`)
  .join('\n')}
`
}
function listFiles(pre, files){
  return `
<!DOCTYPE html>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<title>Browser Manga Reader</title>
<div>
  <a href="?read=true">Read Here</a>
  <a href="/${pre.endsWith('/') ? pre.slice(0, pre.length-1) : pre}/..">Back</a>
</div>
<div>
  <ul>
    ${files
      .map(file => `<li><a href="/${path.join(pre, file)}">${file}</a></li>`)
      .join('\n')}
  </ul>
</div>
`
}

http.createServer((req, res) => {
  const [urlDir, readMode] = path.join('.', req.url).split('?read=true')
  const dir = decodeURI(urlDir)||'./'

  try {
    if (isDirectory(dir)) {
      const files = fs.readdirSync(dir)
      if (typeof readMode === 'string') {
        res.end(readManga(dir, files))
      } else {
        res.end(listFiles(dir, files))
      }
    } else {
      fs.readFile(dir, (err, data) => {
        if (err) throw err
        res.end(data)
      })
    }
  } catch (error) {
    console.error(error)
    if (error.code === 'ENOENT') {
      res.statusCode = 404
      res.end()
    }
  }

}).listen(5000, _ => console.log('server running port 5000'))

