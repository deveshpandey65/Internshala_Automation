const express = require('express');
const http = require('http');
const { apply } = require('./Apply.jsx');
const cors = require('cors');
const multer = require('multer');

const { err_count } = require('./Apply.jsx');

const app = express();
app.use(cors());
app.options('/api/apply', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const myServer = http.createServer(app);
app.listen(8001, () => {
    console.log("Running at 8001");
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const { email } = req.body; 
        const fileName = `${email}.pdf`;
        cb(null, fileName);
    }
});


const upload = multer({ storage: storage });

app.post('/api/apply', upload.single('resume'), async (req, res) => {
    const { email, password, coverLetter } = req.body;
    const resume = req.file;

    const url = "https://internshala.com/registration/student?utm_source=is_header_homepage";
    const num = 5;

    try {
        await apply(url, email, password, coverLetter, num);
        res.send(`${num - err_count} Application process completed`);
    } catch (error) {
        res.status(500).send(`Login Error: Wrong Credentials`);
    }
});


