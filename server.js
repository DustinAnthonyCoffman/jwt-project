require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

app.use(express.json())

const posts = [
    {
        username: 'Kyle',
        title: 'Post 1'
    },
    {
        username: 'Jim',
        title: 'Post 2'
    }
]

const users = []

//auth tutorial code
app.get('/users', (req, res) => {
    res.json(users)
})

app.post('/users', async (req, res) => {
    try {
        //generate the salt and hash in one step, just specify the round as 10
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = { name: req.body.name, password: hashedPassword}
        users.push(user)
        res.status(201).send()
    }
    catch {
        res.status(500).send()
    }
})

app.post('/users/login', async(req, res) => {
    const user = users.find(user => user.name === req.body.name)
    if(user == null) {
        return res.status(400).send('cannot find user')
    }
    try {
        //compare allows us to pass the initial password and the hashed passowrd, it gets the salt out of it and compares them
        if(await bcrypt.compare(req.body.password, user.password)) {
            res.send('Success')
        }
        else {
            res.send('Not Allowed')
        }
    }
    catch {
        res.status(400).send()
    }
})

app.get('/posts', authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.name))
})
//end auth tutorial code

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err)
    if (err) return res.sendStatus(403)
    req.user = user
    next()
    })
}

app.listen(3000)