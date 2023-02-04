const path = require('path')
const fs = require('fs');
var url = require('url');
const { createCanvas, loadImage } = require('canvas')

// Require the framework and instantiate it
const fastify = require('fastify')({
    logger: true
})

// Register fasity static
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, '/../static'),
    prefix: '/', // optional: default '/'
})

// Add cors support
fastify.register(require('@fastify/cors'), {
    // put your options here
    origin: '*'
})

// Declare a route
fastify.get('/', async function (request, reply) {
    reply.redirect('/index.html')
})

fastify.get('/canvasmerge', async function (request, reply) {
    // Load box image
    const box = await loadImage('http://localhost:3000/images/box.svg')
    const head = await loadImage('http://localhost:3000/images/head.svg')
    const face = await loadImage('http://localhost:3000/images/face.svg')
    var boxWidth = box.width
    var boxHeight = box.height
    // 创建画布
    const canvas = createCanvas(boxWidth, boxHeight)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(box, 0, 0, boxWidth, boxHeight)
    ctx.drawImage(head, 0, 0, boxWidth, boxHeight)
    ctx.drawImage(face, 0, 0, boxWidth, boxHeight)

    const MIME = "image/png"
    var data = canvas.toBuffer()
    console.log("data:", data)
    // Set reply type of content
    reply.header("Content-Type", MIME)
    reply.code(200)
    console.log("data:", data)
    reply.send(data) // Must be binary
})


fastify.get('/xmlmerge', async function (request, reply) {
    // Load box image
    var xmldoc = require('xmldoc');

    var boxFilePath = process.cwd() + "/static/images/box.svg"
    var headFilePath = process.cwd() + "/static/images/head.svg"
    var faceFilePath = process.cwd() + "/static/images/face.svg"
    
    var boxData = fs.readFileSync( boxFilePath, 'utf-8')
    var boxdoc = new xmldoc.XmlDocument(boxData);
    var headdoc = new xmldoc.XmlDocument(fs.readFileSync(headFilePath));
    var facedoc = new xmldoc.XmlDocument(fs.readFileSync(faceFilePath));
    
    var pandadoc = boxdoc
    console.log(boxdoc)
    headdoc.eachChild(function (child) {
        console.log(child.attr.name)
        pandadoc.appendChild(child)
    })

    const MIME = "image/svg+xml"
    var data = pandadoc //boxdoc.toString({compressed:true})
    console.log("data:", data)
    // Set reply type of content
    reply.header("Content-Type", MIME)
    reply.code(200)
    reply.send(data) // Must be binary
})

// Run the server!
const start = async () => {
    fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err, address) {
        if (err) {
            fastify.log.error(err)
            process.exit(1)
        }
        // Server is now listening on ${address}
        fastify.log.info(`Server is now listening on ${address}`)
    })
}
start()