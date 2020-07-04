const express = require ('express');
require('./db/mongoose');
const Task = require ('./models/task');
const app = express();
const port = process.env.PORT || 3000;
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

// app.use((req,res,next)=>{
//    res.status(503).send('Server on maintenance... try again later')
// });



app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, ()=> {
    console.log('Server listening on port ' + port);
});

