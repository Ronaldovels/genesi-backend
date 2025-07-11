import express from 'express';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const router = express.Router();

// Configuração do Multer para upload de arquivos
const upload = multer({ dest: 'uploads/' });

// Endpoint principal
router.post('/', upload.single('audio'), async (req, res) => {
  try {
    // 1. Recebe o arquivo de áudio
    const audioFile = req.file;
    const userId = req.body.userId || null;
    if (!audioFile) {
      return res.status(400).json({ error: 'Arquivo de áudio não enviado.' });
    }

    // 2. Encaminha o áudio para o n8n (como multipart/form-data)
    const n8nWebhookUrl = 'https://gudrade.app.n8n.cloud/webhook-test/consultor-financeiro';
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(audioFile.path), audioFile.originalname);
    if (userId) formData.append('userId', userId);

    const n8nResponse = await axios.post(n8nWebhookUrl, formData, {
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // Remove arquivo temporário
    fs.unlink(audioFile.path, () => {});

    // 3. Devolve para o frontend exatamente o que o n8n respondeu
    res.status(n8nResponse.status).send(n8nResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar a requisição', details: error.message });
  }
});

export default router; 