const express = require('express');
const http = require('http');
const { apply } = require('./Apply.jsx');
const cors = require('cors');
const app = express();
const {err_count} =require('./Apply.jsx')

app.use(cors());
app.options('/api/apply', cors()); 

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const myServer = http.createServer(app);
app.listen(8001, () => {
    console.log("Running at 8001");
});

app.post('/api/apply', async (req, res) => {
    const { email, password, coverLetter } = req.body;
    const url = "https://internshala.com/registration/student?utm_source=is_header_homepage";
    const num=5
    try {
        await apply(url, email, password, coverLetter,num);
        res.send(`${num - err_count} Application process completed`);
    } catch (error) {
        res.status(500).send(`Login Error Wrong Credentials`);
    }
});


// app.get('/api/apply', async (req, res) => {
//     const url = "https://internshala.com/registration/student?utm_source=is_header_homepage";
//     const email = "deveshpa65@gmail.com";
//     const passwd = "Deveshpa65";
//     try {
//         await apply(url, email, passwd);
//         res.send('Application process completed');
//     } catch (error) {
//         res.status(500).send(`Error during application process: ${error.message}`);
//     }
// });
