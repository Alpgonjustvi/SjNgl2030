// routes/event.js
const express = require('express');
const Event = require('../models/Event');
const Message = require('../models/Message'); 
const router = express.Router();

router.post('/create_event', async (req, res) => {
  try {
    const { name, expiresAt } = req.body;

    const count = await Event.countDocuments();

    if (count >= 1) {
      return res.status(400).json({ error: "limit of event number is one" });
    }

    if (!name || !expiresAt) {
      return res.status(400).json({ error: 'name and expire date are required' });
    }

    await Message.deleteMany({ event: { $exists: true, $ne: null } });

    const event = new Event({
      name,
      expiresAt: new Date(expiresAt),
    });

    await event.save();

    res.json({ success: true, event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

router.get('/getEventCount', async (req, res) => {
    try {
      const count = await Event.countDocuments();
      const event = await Event.findOne(); // varsa ilk event'i alır
  
      res.json({ 
        count, 
        event 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server_error' });
    }
  });
  
  

module.exports = router;
