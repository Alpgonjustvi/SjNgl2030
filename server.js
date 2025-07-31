const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const confirmCodeRouter = require('./routes/confirmCode');
const twofaRouter = require('./routes/twofa');
const middlewareRouter = require('./middleware/deleteTrusted');
const sendMessageRouter = require('./routes/sendMessage');
const checkFingerprintRouter = require('./routes/checkFingerprint');
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 1001;

mongoose.connect(process.env.MONGO_URI, {});

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());


//API allowed with out login
app.use("/api", (req, res, next) => {
  const allowedPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/send-register-code",
    "/decode-token",
    "/confirm-code",
    "/profile",
    "/check-device",
    "/logout",
    "/sendMessage"
  ];

  // Bu path'lerde token zorunlu değil
  if (allowedPaths.some(path => req.path.startsWith(path))) {

    return next();
  }

  //console.log(req.path)
  // Cookie'den token al
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Giriş yapman lazım" });
  }


  // Token doğrula
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token geçersiz veya süresi dolmuş" });
    req.user = decoded;
    next();
  });
});

//API
app.use('/api', authRouter);
app.use('/api', profileRouter);
app.use('/api', confirmCodeRouter);
app.use('/api', twofaRouter);
app.use('/api', sendMessageRouter);
app.use('/middleware', middlewareRouter);
app.use('/api', checkFingerprintRouter)

//REGISTER BLOK
app.get(['/register', '/register.html'], (req, res) => {
  const token = req.query.token;

  // Token yoksa veya geçersizse 403
  if (!token) return res.status(403).send('Token is required');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token doğru ama 10 dakika geçmişse jwt.verify hata verir
    if (decoded.purpose !== 'register') {
      return res.status(403).send('Invalid token');
    }

    // Token geçerli → register.html gönder
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
  } catch (err) {
    console.log(err);
    return res.status(403).send('Token expired or invalid');
  }
});




const profilePath = path.join(__dirname, 'public', 'profile.html');

app.get(['/profile', '/profile.html'], async (req, res) => {
  try {
    // Profil bilgisini al
    const response = await axios.get('http://192.168.1.5:1001/api/profile', {
      headers: {
        cookie: req.headers.cookie // kullanıcı cookie'lerini gönder
      }
    });

    const profile = response.data;

    fs.readFile(profilePath, 'utf8', (err, html) => {
      if (err) return res.status(500).send("Dosya okunamadı");

      // Eğer admin ise <a>ADMIN1</a> ekle, değilse orijinal html gönder
      let newHtml = html;
      if (profile.user._id == process.env.ADMIN1_ID) {
        const buttonHtml = `<button id="SHAREADMIN" onclick="
  fetch('/api/generate-register-token')
    .then(res => res.json())
    .then(data => {
      document.getElementById('result').innerHTML = 
        \`<a href='\${data.url}' target='_blank'>\${window.location.origin}/register/</a>\`;
    })
    .catch(err => {
      document.getElementById('result').textContent = 'Error generating token';
      console.error(err);
    });
">Share Admin</button><div id="result"></div>`;

  newHtml = html.replace('</body>', buttonHtml + '</body>');

      }

      res.send(newHtml);
    });
  } catch (err) {
    // Profil bilgisi alınamadıysa sadece orijinal html'i gönder
    fs.readFile(profilePath, 'utf8', (err, html) => {
      if (err) return res.status(500).send("Dosya okunamadı");
      res.send(html);
    });
  }
});


// ENGELLENEN sayfalar
//YOK

// Statik dosyalar
app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts', express.static(path.join(__dirname, '/scripts')));

// Ana sayfa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'send_ngl.html'));
});

// *** Public içindeki bütün .html'ler için .html'siz yönlendirme ***
app.get('/:page', (req, res, next) => {
  const filePath = path.join(__dirname, 'public', `${req.params.page}.html`);
  res.sendFile(filePath, (err) => {
    if (err) next();
  });
});


app.use((req, res) => {
  res.status(404).send("Invalid Path: 404");
});




app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
