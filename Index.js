const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/extract', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({ error: "No URL provided" });
    }

    try {
        // TeraBox links often need specific headers to look like a mobile app request
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Mobile Safari/537.36'
            }
        });

        // Basic logic to find the stream/download link in the page source
        // Note: Real bypassing often requires matching 'surl' and 'uk' parameters
        const pageSource = response.data;
        
        // This is a simplified regex to find common stream patterns
        // In a production app, you'd parse the 'initData' object from the script tags
        const streamMatch = pageSource.match(/\"download_url\":\"(.*?)\"/);
        const titleMatch = pageSource.match(/\"server_filename\":\"(.*?)\"/);

        if (streamMatch && streamMatch[1]) {
            const directLink = streamMatch[1].replace(/\\/g, '');
            res.json({
                success: true,
                title: titleMatch ? titleMatch[1] : "TeraBox Video",
                stream_link: directLink,
                download_link: directLink
            });
        } else {
            res.status(404).json({ error: "Direct link not found. Link might be private or expired." });
        }
    } catch (error) {
        res.status(500).json({ error: "Server error during extraction" });
    }
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
