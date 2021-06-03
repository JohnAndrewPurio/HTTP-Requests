const {createServer} = require('http')
const fs = require('fs')
const users = require('./users')

const port = 4000

const routes = {
    '/home': 'views',
    '/about': 'about'
}

let currentID = users.length

const server = createServer( (req, res) => {
    if(req.url === '/end') {
        server.close(err => console.log(err))
        res.end()
    }

    let route = routes[req.url]

    if(!route) route = 'error'
    if(req.url === '/') route = 'views'

    if(/^\/users/.test(req.url)) {
        if(req.method === 'POST') {
            let body = "";

            req.on('data', function (chunk) {
                body += chunk;
            });

            req.on('end', function () {
                const postedData = JSON.parse(body)

                if(!postedData['name'] || !postedData['avatar']) {
                    res.statusCode = 400
                    res.write('Error 400: Bad Request')
                    res.end()

                    return
                }
            
                postedData['id'] = String(++currentID)
                postedData['createdAt'] = new Date(Date.now())
            
                users.push(postedData)
            
                res.writeHead(201);
                res.write( JSON.stringify(users) )
                res.end();
            })
            return 
        }

        if(req.method === 'DELETE') {
            let toDelete = req.url.split('/')
            toDelete = toDelete[toDelete.length - 1]
            const userToDelete = users.find( user => user.id === toDelete )

            if(!userToDelete) {
                res.statusCode = 400
                res.write('Error 400: Bad Request')
                res.end()

                return
            }
            
            users.splice( users.indexOf(userToDelete), 1)
            res.statusCode = 200
            res.write('Successfully deleted user ' + userToDelete.name)
            res.end()

            return
        }

        res.write(JSON.stringify(users))
        res.end()

        return
    }

    res.setHeader('Content-Type', 'text/html')
    res.statusCode = 200

    fs.readFile(`./${route}/index.html`, (err, data) => {
        if(err) {
            res.write('Error 400')
        }

        res.write(data)
        res.end()
    })
})

server.listen(port, 'localhost', () => {
    console.log('Server is listening in port ' + port )
})