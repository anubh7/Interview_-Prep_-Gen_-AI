const express=require('express');
const app=express();
const authRouter=require('./routes/auth.routes');
const cookieParser=require('cookie-parser');
const cors=require('cors');
const interviewRouter=require('./routes/interview.routes');

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true
}));

/* using this router for all the auth related routes */
app.use('/api/auth',authRouter);
app.use('/api/interview',interviewRouter);


module.exports=app;