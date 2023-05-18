const fs = require('fs').promises;
const access = require('fs').access;
const path = require('path');

const express = require('express');

const app = express();

app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'));
app.use('/feedback', express.static('feedback'));

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'pages', 'feedback.html');
    res.sendFile(filePath);
});

app.get('/exists', (req, res) => {
    const filePath = path.join(__dirname, 'pages', 'exists.html');
    res.sendFile(filePath);
});

app.post('/create', async (req, res) => {
    const title = req.body.title;
    const content = req.body.text;

    const adjTitle = title.toLowerCase();

    const tempFilePath = path.join(__dirname, 'temp', adjTitle + '.txt');
    const finalFilePath = path.join(__dirname, 'feedback', adjTitle + '.txt');

    await fs.writeFile(tempFilePath, content);
    access(finalFilePath, fs.constants.F_OK, async (err) => {
        if (err) {
            console.log('entering err condition');
            console.log('tempFilePath', tempFilePath);
            console.log('finalFilePath', finalFilePath);
            await fs.copyFile(
                tempFilePath.toString(),
                finalFilePath.toString()
            );
            await fs.unlink(tempFilePath.toString(), (err) => {
                console.log('inside fs.unlink');
                if (err) {
                    console.log('unlink error', err);
                } else {
                    console.log('Unlink succeeded');
                }
            });
            res.redirect('/');
        } else {
            res.redirect('/exists');
        }
    });
});

app.listen(process.env.PORT);
