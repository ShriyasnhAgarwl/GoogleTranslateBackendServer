const { Translate } = require("@google-cloud/translate").v2;
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const corsOptions = {
  origin: "http://localhost:3000", // Allow requests from this origin
  optionsSuccessStatus: 200, // Some legacy browsers (IE11) choke on 204
};
app.use(cors(corsOptions));
app.use(express.json());
let CREDENTIALS;

try {
  CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
} catch (error) {
  console.error("Error parsing CREDENTIALS:", error);
  process.exit(1); // Exit the process if credentials are invalid
}

const translate = new Translate({
  credentials: CREDENTIALS,
  projectId: CREDENTIALS.project_id,
});

app.post("/translate", async (req, res) => {
  const { text, targetLanguage } = req.body;
  if (!text || !targetLanguage) {
    return res
      .status(400)
      .json({ error: "Missing text or targetLanguage in request body" });
  }
  try {
    const [response] = await translate.translate(text, targetLanguage);
    res.send({ translatedText: response });
  } catch (error) {
    console.log(`Error at translateText --> ${error}`);
    res.status(500).send("Error translating text");
  }
});

app.get("/languages", async (req, res) => {
  try {
    const [languages] = await translate.getLanguages();
    res.send({ languages });
  } catch (error) {
    console.log(`Error at listLanguages --> ${error}`);
    res.status(500).send("Error fetching languages");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
