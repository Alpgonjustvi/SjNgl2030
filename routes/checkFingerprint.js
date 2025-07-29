const express = require('express');
const path = require('path');
const router = express.Router();
const ThirdUser = require('../models/thirdUser');


router.post('/check-device', async (req, res) => {
  try {
    const { deviceId } = req.body;
    if (!deviceId) return res.status(400).json({ error: 'DeviceId required' });

    let user = await ThirdUser.findOne({ id: deviceId });

    if (!user) {
      user = new ThirdUser({ id: deviceId });
      await user.save();
      console.log(`Yeni cihaz kaydedildi: ${deviceId}`);
    }

    return res.json({ blocked: user.blocked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/block-device', async (req, res) => {
  try {
    const { deviceId } = req.body;
    if (!deviceId) return res.status(400).json({ error: 'DeviceId required' });

    if (deviceId === "0000") {
      const result = await ThirdUser.updateMany({}, { blocked: true });
      return res.json({ success: true, message: `All users blocked (${result.modifiedCount} users)` });
    }


    const user = await ThirdUser.findOneAndUpdate(
      { id: deviceId },
      { blocked: true },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'Device not found' });

    return res.json({ success: true, device: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/user/:fingerprint', async (req, res) => {
  try {
    const { fingerprint } = req.params;
    const user = await ThirdUser.findOne({ id: fingerprint });

    if (!user) {
      return res.status(404).json({ error: "User bulunamadı" });
    }

    res.json(user);
  } catch (err) {
    console.error("Hata:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

module.exports = router;
