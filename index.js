const express = require ('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require ('cors')
const jwt = require('jsonwebtoken')
const app= express()
require('dotenv').config()
const port = process.env.PORT||5000


// middleware
app.use(cors())
app.use(express.json())



console.log(process.env.DB_USER)
console.log(process.env.DB_PASSWORD)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hvwcwlz.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT (req, res, next){
    const authHeaders = req.headers.authorization;
    if(!authHeaders){
        return res.status(401).send({message:'unauthorized access'})
    }

    const token = authHeaders.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(401).send({message:'unauthorized access'})
        }
        req.decoded = decoded;
        next()
    })
}

async function run(){

    try{
        const serviceCollection =client.db('donticsCare').collection('services')

        const ordersCollection = client.db('donticsCare').collection('orders')
        const reviewCollection = client.db('donticsCare').collection('review')

        app.post('/jwt', (req, res) =>{
            const user = req.body;
            console.log(user)
            const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'10 days'})
            res.send({token})
        })

        app.get('/service/:id',async (req,res) =>{
            const id = req.params.id;
            const query ={_id:ObjectId(id)}
            const service = await serviceCollection.findOne(query)
            res.send(service)
            
        })

        app.get('/services', async (req, res) =>{
            const query ={}
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })
        app.post('/orders', async (req, res) =>{
                const order = req.body;
                const result = await ordersCollection.insertOne(order)
                res.send(result);
        })
        app.post('/services', async (req, res) =>{
                const service = req.body;
                const result = await serviceCollection.insertOne(service)
                res.send(result);
        })

        app.get('/servicesThree', async (req, res) =>{
            const query ={}
            const cursor = serviceCollection.find(query)
            const services = await cursor.limit(3).toArray()
            res.send(services)
        })


        app.get('/review', async(req,res) =>{
            
            const decoded = req.decoded;
            console.log('inside review', decoded)

            let query={};
            if(req.query.email){
                query = {
                    email :req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const review =await cursor.toArray()
            res.send(review)
        })


        app.post('/review', async (req, res) =>{
            const review=req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })
        app.delete('/review/:id', async (req, res) =>{
            const id = req.params.id;
            const query ={_id:ObjectId(id)}
            const result = await reviewCollection.deleteOne(query);
            res.send(result)
        })

    }


    finally{

    }

}
run().catch(err =>console.error(err))



app.get('/', (req, res) =>{
    res.send('my api is running')
})

app.listen(port, ()=>{
    console.log(`my api is running on port,${port}`)
})