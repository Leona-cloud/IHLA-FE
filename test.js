const express = require('express');
const mongoose = require('mongoose');
const xlsx = require('xlsx');  // For Excel file creation
const path = require('path');

const app = express();
app.use(express.json());

// Define the schema
const FormSchema = new mongoose.Schema({
    math: { type: Object, required: true },
    science: { type: Object, required: true },
    history: { type: Object, required: true }
});

const FormData = mongoose.model('FormData', FormSchema);

// API to save answers from the frontend
app.post('/sections', async (req, res) => {
    const { math, science, history } = req.body;

    try {
        const newFormData = new FormData({ math, science, history });
        await newFormData.save();

        res.status(201).json({ message: 'Data saved successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error saving data', error: err });
    }
});

// API to export data into an Excel workbook
app.get('/export', async (req, res) => {
    try {
        const allData = await FormData.find();

        // Create a new workbook
        const workbook = xlsx.utils.book_new();

        // Create a sheet for each section
        const mathData = allData.map(item => ({
            Question: 'What is 2 + 2?',
            Answer: item.math.answer
        }));
        const mathWorksheet = xlsx.utils.json_to_sheet(mathData);
        xlsx.utils.book_append_sheet(workbook, mathWorksheet, 'Math');

        const scienceData = allData.map(item => ({
            Question: 'What is H2O?',
            Answer: item.science.answer
        }));
        const scienceWorksheet = xlsx.utils.json_to_sheet(scienceData);
        xlsx.utils.book_append_sheet(workbook, scienceWorksheet, 'Science');

        const historyData = allData.map(item => ({
            Question: 'When did WW2 start?',
            Answer: item.history.answer
        }));
        const historyWorksheet = xlsx.utils.json_to_sheet(historyData);
        xlsx.utils.book_append_sheet(workbook, historyWorksheet, 'History');

        // Write the workbook to a file
        const filePath = path.join(__dirname, 'form_data_export.xlsx');
        xlsx.writeFile(workbook, filePath);

        // Send the file for download
        res.download(filePath);
    } catch (err) {
        res.status(500).json({ message: 'Error exporting data', error: err });
    }
});

// Connect to MongoDB and start the server
mongoose.connect('mongodb://localhost:27017/formsDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(3000, () => {
            console.log('Server running on port 3000');
        });
    })
    .catch(err => console.log(err));
