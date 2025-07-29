const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const ThirdUser = require('../models/thirdUser');

router.patch('/sendMessage', async (req, res) => {
  try {
    const { ngl, fingerprint } = req.body;

    if (!ngl || ngl.trim() === "") {
      return res.status(400).json({ error: "ngl value is required" });
    }

    const newMessage = new Message({
      ngl,
      fingerprint: fingerprint || "0000"
    });

    await newMessage.save();

    res.json({ success: true, message: "Message saved successfully!" });
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/messages', async (req, res) => {
  try {
    // Önce tüm mesajları createdAt'a göre al
    const messages = await Message.find().sort({ createdAt: -1 }).lean();

    // Mesajların fingerprint'lerini topla
    const fingerprints = [...new Set(messages.map(msg => msg.fingerprint))];

    // Bu fingerprint'lere sahip kullanıcıları bul
    const users = await ThirdUser.find({ id: { $in: fingerprints } }).lean();

    // Kullanıcıları id'ye göre objeye çevir (hız için)
    const userMap = {};
    users.forEach(u => {
      userMap[u.id] = u;
    });

    // Mesajları bloklu veya bloklu değil diye işaretle
    const messagesWithBlocked = messages.map(msg => {
      const user = userMap[msg.fingerprint];
      return {
        ...msg,
        blocked: user ? user.blocked : false
      };
    });

    // Önce blocked = false olanlar, sonra blocked = true olanlar, her grupta createdAt'a göre sıralı
    const sortedMessages = [
      ...messagesWithBlocked.filter(m => !m.blocked).sort((a,b) => b.createdAt - a.createdAt),
      ...messagesWithBlocked.filter(m => m.blocked).sort((a,b) => b.createdAt - a.createdAt),
    ];

    res.json(sortedMessages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Server error" });
  }
});

  router.get('/messages/:id', async (req, res) => {
    try {
      const message = await Message.findById(req.params.id);
      if (!message) {
        return res.status(404).json({ error: "Mesaj bulunamadı" });
      }
      res.json(message);
    } catch (err) {
      console.error("Mesaj getirme hatası:", err);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  });
  
  router.delete('/messages/:id', async (req, res) => {
    try {
      const deletedMessage = await Message.findByIdAndDelete(req.params.id);
      if (!deletedMessage) {
        return res.status(404).json({ error: "Mesaj bulunamadı" });
      }
      res.json({ success: true, message: "Mesaj silindi" });
    } catch (err) {
      console.error("Mesaj silme hatası:", err);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  });

router.post("/uploadStoryImage", async (req, res) => {
    try {
      const base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
      const fileName = `${Date.now()}.png`;
      const filePath = path.join(__dirname, "../public/stories", fileName);
  
      fs.writeFileSync(filePath, base64Data, "base64");
  
      // Kullanıcıya public URL dön
      res.json({ url: `/stories/${fileName}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Upload failed" });
    }
  });
  
module.exports = router;
