const express = require("express");

const app = express();

const PORT = 3000;


// ==============================
// MIDDLEWARE
// ==============================

// Allows the server to receive JSON data
app.use(express.json());


// ==============================
// QUIZ DATA
// ==============================

const questions = [

    {
        id: 1,
        category: "web",
        question: "Which language is used to structure a webpage?",
        options: [
            "HTML",
            "CSS",
            "JavaScript",
            "Python"
        ],
        answer: "HTML"
    },

    {
        id: 2,
        category: "web",
        question: "Which language is used to style a webpage?",
        options: [
            "HTML",
            "CSS",
            "JavaScript",
            "Python"
        ],
        answer: "CSS"
    },

    {
        id: 3,
        category: "web",
        question: "Which HTML tag is used to create a hyperlink?",
        options: [
            "<link>",
            "<a>",
            "<href>",
            "<url>"
        ],
        answer: "<a>"
    },

    {
        id: 4,
        category: "javascript",
        question: "Which keyword is used to declare a constant?",
        options: [
            "var",
            "let",
            "const",
            "constant"
        ],
        answer: "const"
    },

    {
        id: 5,
        category: "javascript",
        question: "Which operator checks strict equality?",
        options: [
            "=",
            "==",
            "===",
            "!="
        ],
        answer: "==="
    },

    {
        id: 6,
        category: "javascript",
        question: "Which method is used to add an item to an array?",
        options: [
            "add()",
            "push()",
            "insert()",
            "append()"
        ],
        answer: "push()"
    },

    {
        id: 7,
        category: "general",
        question: "What is the capital of France?",
        options: [
            "London",
            "Paris",
            "Rome",
            "Madrid"
        ],
        answer: "Paris"
    },

    {
        id: 8,
        category: "general",
        question: "Which planet is known as the Red Planet?",
        options: [
            "Earth",
            "Mars",
            "Venus",
            "Jupiter"
        ],
        answer: "Mars"
    },

    {
        id: 9,
        category: "general",
        question: "How many continents are there?",
        options: [
            "5",
            "6",
            "7",
            "8"
        ],
        answer: "7"
    },

    {
        id: 10,
        category: "general",
        question: "What is the chemical formula for water?",
        options: [
            "CO2",
            "H2O",
            "O2",
            "NaCl"
        ],
        answer: "H2O"
    }

];


// ==============================
// GET /
// ==============================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "QuizMaster Backend API is running!"
    });

});


// ==============================
// GET ALL QUESTIONS
// ==============================

app.get("/api/questions", (req, res) => {

    // Do not send correct answers to the client
    const publicQuestions = questions.map(question => {

        return {
            id: question.id,
            category: question.category,
            question: question.question,
            options: question.options
        };

    });

    res.json({
        success: true,
        count: publicQuestions.length,
        questions: publicQuestions
    });

});


// ==============================
// GET QUESTIONS BY CATEGORY
// ==============================

app.get("/api/questions/:category", (req, res) => {

    const category =
        req.params.category.toLowerCase();


    const filteredQuestions =
        questions.filter(question => {

            return question.category === category;

        });


    // Validate category
    if (filteredQuestions.length === 0) {

        return res.status(404).json({

            success: false,
            error: "Category not found",
            availableCategories: [
                "web",
                "javascript",
                "general"
            ]

        });

    }


    // Hide correct answers
    const publicQuestions =
        filteredQuestions.map(question => {

            return {
                id: question.id,
                category: question.category,
                question: question.question,
                options: question.options
            };

        });


    res.json({

        success: true,
        category: category,
        count: publicQuestions.length,
        questions: publicQuestions

    });

});


// ==============================
// POST /api/answer
// ==============================

app.post("/api/answer", (req, res) => {

    const {
        questionId,
        answer
    } = req.body;


    // ==========================
    // VALIDATION
    // ==========================

    if (
        questionId === undefined ||
        answer === undefined
    ) {

        return res.status(400).json({

            success: false,
            error: "questionId and answer are required"

        });

    }


    if (
        typeof questionId !== "number" ||
        typeof answer !== "string"
    ) {

        return res.status(400).json({

            success: false,
            error: "questionId must be a number and answer must be a string"

        });

    }


    if (answer.trim() === "") {

        return res.status(400).json({

            success: false,
            error: "Answer cannot be empty"

        });

    }


    // ==========================
    // FIND QUESTION
    // ==========================

    const question =
        questions.find(question => {

            return question.id === questionId;

        });


    if (!question) {

        return res.status(404).json({

            success: false,
            error: "Question not found"

        });

    }


    // ==========================
    // CHECK ANSWER
    // ==========================

    const isCorrect =
        question.answer.toLowerCase() ===
        answer.trim().toLowerCase();


    // ==========================
    // SEND RESPONSE
    // ==========================

    res.json({

        success: true,

        questionId: question.id,

        submittedAnswer: answer,

        correctAnswer: question.answer,

        isCorrect: isCorrect,

        message: isCorrect
            ? "Correct answer!"
            : "Incorrect answer."

    });

});


// ==============================
// POST /api/score
// ==============================

app.post("/api/score", (req, res) => {

    const { answers } = req.body;


    // ==========================
    // VALIDATION
    // ==========================

    if (!Array.isArray(answers)) {

        return res.status(400).json({

            success: false,
            error: "answers must be an array"

        });

    }


    if (answers.length === 0) {

        return res.status(400).json({

            success: false,
            error: "Answers array cannot be empty"

        });

    }


    let score = 0;


    // ==========================
    // CHECK ALL ANSWERS
    // ==========================

    answers.forEach(submitted => {

        const question =
            questions.find(question => {

                return question.id ===
                    submitted.questionId;

            });


        if (
            question &&
            typeof submitted.answer === "string" &&
            question.answer.toLowerCase() ===
            submitted.answer.trim().toLowerCase()
        ) {

            score++;

        }

    });


    const total =
        answers.length;


    const percentage =
        Math.round(
            (score / total) * 100
        );


    // ==========================
    // SEND SCORE
    // ==========================

    res.json({

        success: true,

        score: score,

        total: total,

        percentage: percentage,

        message:
            percentage >= 70
                ? "Good job!"
                : "Keep practicing!"

    });

});


// ==============================
// HANDLE UNKNOWN ROUTES
// ==============================

app.use((req, res) => {

    res.status(404).json({

        success: false,
        error: "API endpoint not found"

    });

});


// ==============================
// START SERVER
// ==============================

app.listen(PORT, () => {

    console.log(
        `QuizMaster API running at http://localhost:${PORT}`
    );

});