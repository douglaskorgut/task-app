
const mongodb = require ('mongodb');
const MongoClient = mongodb.MongoClient;

const connectionURL = (process.env.MONGODB_CONNECTION_URL);
const databaseName = 'task-manager';

const connectToMongoServer = () => new Promise((resolve, reject) => {
    MongoClient.connect(
        connectionURL,
        { useUnifiedTopology: true })
        .catch( ( error ) => {reject(error)})
        .then(  ( mongoClient) => {

            let name = `Douglas`;
            console.log('Connected successfully');

            const db = mongoClient.db(databaseName);

            // db.collection('users').insertOne({
            //     name: name.toString(),
            //     age: 29
            // })
            //     .then( (result) => console.log(`User ${result.insertedId} added successfully`))
            //     .catch((error)=> reject(error));
            //
            // db.collection('users').insertMany([
            //     {
            //         name: "Isa",
            //         age: 25
            //     },
            //     {
            //         name: "Lola",
            //         age: 8
            //     }
            // ]).then((result)=>{
            //     console.log('Inserted many users successfully');
            // }).catch((error)=>{
            //     reject(error);
            // });

            // db.collection('tasks').insertMany([
            //     {
            //         description: 'Dar banho na Lola',
            //         completed: false
            //     },
            //     {
            //         description: 'Devolver o jogo',
            //         complete: false
            //     },
            //     {
            //         description: 'Tomar banho',
            //         complete: true
            //     }
            // ]).then((result)=>{
            //     console.log(`Inserted ${result.insertedIds.toString()} on db`)
            // }).catch((error)=>{reject(error)});

            db.collection('users').findOne({name:'Douglas'})
                .then((user)=>{
                    console.log(user)
            })
                .catch((error)=> {
                    reject(error)
                });

            const test = db.collection('users').find({age:29}).toArray((error,users)=>{
                console.log(users)
            })
            resolve (mongoClient);

        });
});

const mongoClient = async () => {
    const client = await connectToMongoServer().catch((error)=> console.log(error));
};

mongoClient().catch((error)=> console.log(error));



